import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamoService } from '../utils/dynamo';
import { createApiResponse } from '../utils/auth';
import { Incident, SOSRequest, RescueTeam, Shelter, DashboardStats } from '../types';

const INCIDENTS_TABLE = process.env.INCIDENTS_TABLE || 'disaster_incidents';
const SOS_TABLE = process.env.SOS_TABLE || 'disaster_sos';
const TEAMS_TABLE = process.env.RESCUE_TEAMS_TABLE || 'disaster_rescue_teams';
const SHELTERS_TABLE = process.env.SHELTERS_TABLE || 'disaster_shelters';

export async function handler(event: Partial<APIGatewayProxyEvent>): Promise<APIGatewayProxyResult> {
  try {
    const [incidents, sosRequests, teams, shelters] = await Promise.all([
      dynamoService.scanItems<Incident>(INCIDENTS_TABLE),
      dynamoService.scanItems<SOSRequest>(SOS_TABLE),
      dynamoService.scanItems<RescueTeam>(TEAMS_TABLE),
      dynamoService.scanItems<Shelter>(SHELTERS_TABLE),
    ]);

    const activeIncidents = incidents.filter(
      (i) => i.status !== 'Resolved' && i.status !== 'Closed'
    ).length;

    const criticalIncidents = incidents.filter(
      (i) => i.severity === 'Critical' && i.status !== 'Resolved' && i.status !== 'Closed'
    ).length;

    const incidentsAwaitingReview = incidents.filter(
      (i) => i.status === 'Reported' || i.status === 'Under Review'
    ).length;

    const resolvedIncidents = incidents.filter(
      (i) => i.status === 'Resolved' || i.status === 'Closed'
    ).length;

    const openSOSRequests = sosRequests.filter(
      (s) => s.status !== 'Resolved' && s.status !== 'Cancelled'
    ).length;

    const teamsDispatched = teams.filter(
      (t) => t.currentStatus === 'Dispatched' || t.currentStatus === 'On Scene'
    ).length;

    const shelterCapacityTotal = shelters.reduce((acc, s) => acc + (s.capacity || 0), 0);
    const shelterOccupancyTotal = shelters.reduce((acc, s) => acc + (s.currentOccupancy || 0), 0);
    const shelterAvailableSlots = Math.max(0, shelterCapacityTotal - shelterOccupancyTotal);

    const stats: DashboardStats = {
      totalIncidents: incidents.length,
      activeIncidents,
      criticalIncidents,
      openSOSRequests,
      incidentsAwaitingReview,
      teamsDispatched,
      resolvedIncidents,
      shelterCapacityTotal,
      shelterOccupancyTotal,
      shelterAvailableSlots,
    };

    return createApiResponse(200, { data: stats, timestamp: new Date().toISOString() });
  } catch (err: any) {
    console.error('Error computing dashboard statistics:', err);
    return createApiResponse(500, { error: err.message || 'Failed to aggregate metrics' });
  }
}
