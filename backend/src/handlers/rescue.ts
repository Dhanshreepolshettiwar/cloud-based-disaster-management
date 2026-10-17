import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { dynamoService } from '../utils/dynamo';
import { extractAuthContext, requireRole, createApiResponse } from '../utils/auth';
import { RescueTeam, TeamStatus } from '../types';

const TABLE_NAME = process.env.RESCUE_TEAMS_TABLE || 'disaster_rescue_teams';

export async function handler(event: Partial<APIGatewayProxyEvent>): Promise<APIGatewayProxyResult> {
  const method = event.httpMethod || 'GET';
  const pathParams = event.pathParameters;

  try {
    const authContext = extractAuthContext(event);

    // GET /rescue/teams
    if (method === 'GET') {
      let teams = await dynamoService.scanItems<RescueTeam>(TABLE_NAME);

      if (teams.length === 0) {
        // Seed default rescue teams if table is empty
        const defaultTeams: RescueTeam[] = [
          {
            teamId: 'team-alpha-01',
            name: 'Alpha Rapid Medical Unit',
            specialization: 'Medical',
            contactPhone: '+1-555-0199',
            currentStatus: 'Available',
            baseLocation: 'Central Emergency Hospital HQ',
            membersCount: 8,
            lastUpdated: new Date().toISOString(),
          },
          {
            teamId: 'team-bravo-02',
            name: 'Bravo Urban Search & Rescue',
            specialization: 'Search & Rescue',
            contactPhone: '+1-555-0245',
            currentStatus: 'Available',
            baseLocation: 'District Fire Station 4',
            membersCount: 12,
            lastUpdated: new Date().toISOString(),
          },
          {
            teamId: 'team-charlie-03',
            name: 'Charlie Flood & Water Rescue',
            specialization: 'Water Rescue',
            contactPhone: '+1-555-0312',
            currentStatus: 'Available',
            baseLocation: 'Harbor Rescue Depot',
            membersCount: 10,
            lastUpdated: new Date().toISOString(),
          },
        ];

        for (const t of defaultTeams) {
          await dynamoService.putItem(TABLE_NAME, t, 'teamId');
        }
        teams = defaultTeams;
      }

      return createApiResponse(200, { data: teams, count: teams.length });
    }

    // POST /rescue/teams (Register new team)
    if (method === 'POST') {
      requireRole(authContext, ['AUTHORITY', 'ADMIN']);

      const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};
      if (!body.name || !body.specialization || !body.contactPhone) {
        return createApiResponse(400, { error: 'name, specialization, and contactPhone are required' });
      }

      const newTeam: RescueTeam = {
        teamId: uuidv4(),
        name: body.name,
        specialization: body.specialization,
        contactPhone: body.contactPhone,
        currentStatus: body.currentStatus || 'Available',
        baseLocation: body.baseLocation || 'Operations Base',
        membersCount: Number(body.membersCount) || 5,
        lastUpdated: new Date().toISOString(),
      };

      await dynamoService.putItem(TABLE_NAME, newTeam, 'teamId');
      return createApiResponse(201, { message: 'Rescue team registered', data: newTeam });
    }

    // PUT /rescue/teams/{id} (Update status/assignment)
    if (method === 'PUT' && pathParams?.id) {
      requireRole(authContext, ['AUTHORITY', 'RESCUE_TEAM', 'ADMIN']);

      const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};
      const existing = await dynamoService.getItem<RescueTeam>(TABLE_NAME, { teamId: pathParams.id });

      if (!existing) {
        return createApiResponse(404, { error: 'Rescue team not found' });
      }

      const updated: RescueTeam = {
        ...existing,
        currentStatus: (body.currentStatus as TeamStatus) || existing.currentStatus,
        assignedIncidentId: body.assignedIncidentId !== undefined ? body.assignedIncidentId : existing.assignedIncidentId,
        assignedSOSId: body.assignedSOSId !== undefined ? body.assignedSOSId : existing.assignedSOSId,
        lastUpdated: new Date().toISOString(),
      };

      await dynamoService.putItem(TABLE_NAME, updated, 'teamId');
      return createApiResponse(200, { message: 'Rescue team updated', data: updated });
    }

    return createApiResponse(405, { error: `Method ${method} not allowed` });
  } catch (err: any) {
    console.error('Error handling rescue team request:', err);
    return createApiResponse(err.message.includes('Forbidden') ? 403 : 500, {
      error: err.message || 'Internal Server Error',
    });
  }
}
