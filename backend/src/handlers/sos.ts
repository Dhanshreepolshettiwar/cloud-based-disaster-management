import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { randomUUID as uuidv4 } from 'crypto';
import { dynamoService } from '../utils/dynamo';
import { extractAuthContext, requireRole, createApiResponse } from '../utils/auth';
import { SOSRequest, SOSStatus } from '../types';

const TABLE_NAME = process.env.SOS_TABLE || 'disaster_sos';

export async function handler(event: Partial<APIGatewayProxyEvent>): Promise<APIGatewayProxyResult> {
  const method = event.httpMethod || 'GET';
  const pathParams = event.pathParameters;

  try {
    const authContext = extractAuthContext(event);

    // GET /sos/{id}
    if (method === 'GET' && pathParams?.id) {
      const sos = await dynamoService.getItem<SOSRequest>(TABLE_NAME, { sosId: pathParams.id });
      if (!sos) {
        return createApiResponse(404, { error: 'SOS request not found' });
      }
      return createApiResponse(200, { data: sos });
    }

    // GET /sos (List SOS requests)
    if (method === 'GET') {
      let requests = await dynamoService.scanItems<SOSRequest>(TABLE_NAME);

      // If normal citizen, only return their own SOS requests unless authority
      if (authContext.role === 'CITIZEN' && authContext.userId !== 'guest-user') {
        requests = requests.filter((r) => r.requesterPhone === authContext.email || r.requesterName === authContext.name);
      }

      // Sort by urgency/critical and newest first
      requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return createApiResponse(200, { data: requests, count: requests.length });
    }

    // POST /sos (Submit SOS Request)
    if (method === 'POST') {
      const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};

      if (!body.emergencyType || !body.locationDescription) {
        return createApiResponse(400, { error: 'emergencyType and locationDescription are required' });
      }

      const now = new Date().toISOString();
      const newSOS: SOSRequest = {
        sosId: uuidv4(),
        requesterName: body.requesterName || authContext.name,
        requesterPhone: body.requesterPhone || 'Not provided',
        emergencyType: body.emergencyType,
        urgency: body.urgency || 'Critical',
        status: 'Submitted',
        latitude: Number(body.latitude) || 0,
        longitude: Number(body.longitude) || 0,
        locationDescription: body.locationDescription,
        peopleCount: Number(body.peopleCount) || 1,
        notes: body.notes || '',
        createdAt: now,
        updatedAt: now,
      };

      await dynamoService.putItem(TABLE_NAME, newSOS, 'sosId');

      return createApiResponse(201, {
        message: 'SOS request registered. Emergency rescue coordination is notified.',
        disclaimer: 'Notice: This platform does not replace official emergency emergency numbers (911/112). Call official authorities if phone lines are accessible.',
        data: newSOS,
      });
    }

    // PUT /sos/{id} (Update Status / Assign Rescue Team)
    if (method === 'PUT' && pathParams?.id) {
      requireRole(authContext, ['AUTHORITY', 'RESCUE_TEAM', 'ADMIN']);

      const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};
      const existing = await dynamoService.getItem<SOSRequest>(TABLE_NAME, { sosId: pathParams.id });

      if (!existing) {
        return createApiResponse(404, { error: 'SOS request not found' });
      }

      const now = new Date().toISOString();
      const updated: SOSRequest = {
        ...existing,
        status: (body.status as SOSStatus) || existing.status,
        assignedTeamId: body.assignedTeamId !== undefined ? body.assignedTeamId : existing.assignedTeamId,
        assignedTeamName: body.assignedTeamName !== undefined ? body.assignedTeamName : existing.assignedTeamName,
        notes: body.notes ? `${existing.notes}\n[${now} by ${authContext.name}]: ${body.notes}` : existing.notes,
        updatedAt: now,
      };

      await dynamoService.putItem(TABLE_NAME, updated, 'sosId');
      return createApiResponse(200, { message: 'SOS status updated', data: updated });
    }

    return createApiResponse(405, { error: `Method ${method} not allowed` });
  } catch (err: any) {
    console.error('Error handling SOS request:', err);
    return createApiResponse(err.message.includes('Forbidden') ? 403 : 500, {
      error: err.message || 'Internal Server Error',
    });
  }
}
