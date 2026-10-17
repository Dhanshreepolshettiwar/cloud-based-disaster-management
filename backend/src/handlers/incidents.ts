import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { dynamoService } from '../utils/dynamo';
import { extractAuthContext, requireRole, createApiResponse } from '../utils/auth';
import { Incident, IncidentStatus, SeverityLevel, DisasterCategory } from '../types';

const TABLE_NAME = process.env.INCIDENTS_TABLE || 'disaster_incidents';

export async function handler(event: Partial<APIGatewayProxyEvent>): Promise<APIGatewayProxyResult> {
  const method = event.httpMethod || 'GET';
  const path = event.path || '/incidents';
  const pathParams = event.pathParameters;

  try {
    const authContext = extractAuthContext(event);

    // GET /incidents/{id}
    if (method === 'GET' && pathParams?.id) {
      const incident = await dynamoService.getItem<Incident>(TABLE_NAME, { incidentId: pathParams.id });
      if (!incident) {
        return createApiResponse(404, { error: 'Incident not found' });
      }
      return createApiResponse(200, { data: incident });
    }

    // GET /incidents
    if (method === 'GET') {
      const queryParams = event.queryStringParameters || {};
      const category = queryParams.category as DisasterCategory;
      const severity = queryParams.severity as SeverityLevel;
      const status = queryParams.status as IncidentStatus;

      let incidents = await dynamoService.scanItems<Incident>(TABLE_NAME);

      if (category) {
        incidents = incidents.filter((i) => i.category === category);
      }
      if (severity) {
        incidents = incidents.filter((i) => i.severity === severity);
      }
      if (status) {
        incidents = incidents.filter((i) => i.status === status);
      }

      // Sort by createdAt descending
      incidents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return createApiResponse(200, { data: incidents, count: incidents.length });
    }

    // POST /incidents (Create Incident)
    if (method === 'POST') {
      const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};

      if (!body.title || !body.description || !body.category) {
        return createApiResponse(400, { error: 'Missing required fields: title, description, category' });
      }

      const now = new Date().toISOString();
      const newIncident: Incident = {
        incidentId: uuidv4(),
        title: body.title,
        description: body.description,
        category: body.category,
        severity: body.severity || 'Medium',
        status: 'Reported',
        locationName: body.locationName || 'Unknown Location',
        latitude: Number(body.latitude) || 0,
        longitude: Number(body.longitude) || 0,
        reporterId: authContext.userId,
        reporterName: body.reporterName || authContext.name,
        reporterContact: body.reporterContact || authContext.email,
        mediaUrls: body.mediaUrls || [],
        createdAt: now,
        updatedAt: now,
        timeline: [
          {
            timestamp: now,
            action: 'Reported',
            actor: authContext.name,
            notes: 'Initial incident report submitted.',
          },
        ],
      };

      await dynamoService.putItem(TABLE_NAME, newIncident, 'incidentId');
      return createApiResponse(201, { message: 'Incident created successfully', data: newIncident });
    }

    // PUT /incidents/{id} (Update Status / Severity / Team Assignment)
    if (method === 'PUT' && pathParams?.id) {
      // Must be Authority, Rescue Team, or Admin
      requireRole(authContext, ['AUTHORITY', 'RESCUE_TEAM', 'ADMIN']);

      const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};
      const existing = await dynamoService.getItem<Incident>(TABLE_NAME, { incidentId: pathParams.id });

      if (!existing) {
        return createApiResponse(404, { error: 'Incident not found' });
      }

      const now = new Date().toISOString();
      const updated: Incident = {
        ...existing,
        status: body.status || existing.status,
        severity: body.severity || existing.severity,
        assignedTeamId: body.assignedTeamId !== undefined ? body.assignedTeamId : existing.assignedTeamId,
        assignedTeamName: body.assignedTeamName !== undefined ? body.assignedTeamName : existing.assignedTeamName,
        updatedAt: now,
        timeline: [
          ...(existing.timeline || []),
          {
            timestamp: now,
            action: body.status ? `Status updated to ${body.status}` : 'Incident updated',
            actor: `${authContext.name} (${authContext.role})`,
            notes: body.notes || 'Status progression update recorded.',
          },
        ],
      };

      await dynamoService.putItem(TABLE_NAME, updated, 'incidentId');
      return createApiResponse(200, { message: 'Incident updated successfully', data: updated });
    }

    return createApiResponse(405, { error: `Method ${method} not allowed` });
  } catch (err: any) {
    console.error('Error handling incident request:', err);
    return createApiResponse(err.message.includes('Forbidden') ? 403 : 500, {
      error: err.message || 'Internal Server Error',
    });
  }
}
