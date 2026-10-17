import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { dynamoService } from '../utils/dynamo';
import { snsService } from '../utils/sns';
import { extractAuthContext, requireRole, createApiResponse } from '../utils/auth';
import { EmergencyAlert } from '../types';

const ALERTS_TABLE = process.env.ALERTS_TABLE || 'disaster_alerts';

export async function handler(event: Partial<APIGatewayProxyEvent>): Promise<APIGatewayProxyResult> {
  const method = event.httpMethod || 'GET';

  try {
    const authContext = extractAuthContext(event);

    // GET /alerts (Public / Citizen / All)
    if (method === 'GET') {
      let alerts = await dynamoService.scanItems<EmergencyAlert>(ALERTS_TABLE);

      if (alerts.length === 0) {
        // Seed initial alert
        const defaultAlert: EmergencyAlert = {
          alertId: 'alert-01',
          title: 'Severe Flash Flood Warning & Coastal Storm Surge Advisory',
          severity: 'Critical',
          affectedRegions: ['East Coastline', 'River Delta Sectors 1-4'],
          instructions: 'Evacuate low-lying coastal flood zones immediately. Move to designated high-ground community shelters.',
          issuedBy: 'National Disaster Preparedness Agency',
          issuedAt: new Date().toISOString(),
          active: true,
          snsMessageId: 'mock-sns-initial-01',
        };
        await dynamoService.putItem(ALERTS_TABLE, defaultAlert, 'alertId');
        alerts = [defaultAlert];
      }

      // Sort newest first
      alerts.sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
      return createApiResponse(200, { data: alerts, count: alerts.length });
    }

    // POST /alerts (Issue Broadcast Alert - Authority or Admin only)
    if (method === 'POST') {
      requireRole(authContext, ['AUTHORITY', 'ADMIN']);

      const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};
      if (!body.title || !body.instructions) {
        return createApiResponse(400, { error: 'title and instructions are required' });
      }

      const alertId = uuidv4();
      const severity = body.severity || 'High';
      const affectedRegions = body.affectedRegions || ['All Districts'];

      // Broadcast via Amazon SNS
      const snsResult = await snsService.publishEmergencyAlert({
        alertId,
        title: body.title,
        severity,
        affectedRegions,
        instructions: body.instructions,
      });

      const newAlert: EmergencyAlert = {
        alertId,
        title: body.title,
        severity,
        affectedRegions,
        instructions: body.instructions,
        issuedBy: `${authContext.name} (${authContext.role})`,
        issuedAt: new Date().toISOString(),
        active: true,
        snsMessageId: snsResult.messageId,
      };

      await dynamoService.putItem(ALERTS_TABLE, newAlert, 'alertId');

      return createApiResponse(201, {
        message: 'Emergency alert issued and broadcast successfully',
        data: newAlert,
      });
    }

    return createApiResponse(405, { error: `Method ${method} not allowed` });
  } catch (err: any) {
    console.error('Error handling alerts request:', err);
    return createApiResponse(err.message.includes('Forbidden') ? 403 : 500, {
      error: err.message || 'Internal Server Error',
    });
  }
}
