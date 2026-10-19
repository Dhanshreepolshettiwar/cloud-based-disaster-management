import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { randomUUID as uuidv4 } from 'crypto';
import { dynamoService } from '../utils/dynamo';
import { extractAuthContext, requireRole, createApiResponse } from '../utils/auth';
import { Shelter, ResourceItem } from '../types';

const SHELTERS_TABLE = process.env.SHELTERS_TABLE || 'disaster_shelters';
const RESOURCES_TABLE = process.env.RESOURCES_TABLE || 'disaster_resources';

export async function handler(event: Partial<APIGatewayProxyEvent>): Promise<APIGatewayProxyResult> {
  const method = event.httpMethod || 'GET';
  const path = event.path || '';
  const isResourcePath = path.includes('/resources');
  const pathParams = event.pathParameters;

  try {
    const authContext = extractAuthContext(event);

    // ================= RESOURCE ENDPOINTS =================
    if (isResourcePath) {
      if (method === 'GET') {
        let resources = await dynamoService.scanItems<ResourceItem>(RESOURCES_TABLE);
        if (resources.length === 0) {
          const defaultResources: ResourceItem[] = [
            {
              resourceId: 'res-1',
              name: 'Emergency Medical Trauma Kits',
              category: 'Medical',
              quantity: 250,
              unit: 'kits',
              storageLocation: 'Central Emergency Depot Bay 3',
              status: 'Available',
              updatedAt: new Date().toISOString(),
            },
            {
              resourceId: 'res-2',
              name: 'Clean Drinking Water Rations',
              category: 'Food & Water',
              quantity: 4800,
              unit: 'liters',
              storageLocation: 'Logistics Warehouse North',
              status: 'Available',
              updatedAt: new Date().toISOString(),
            },
            {
              resourceId: 'res-3',
              name: 'Inflatable Rescue Boats & Lifejackets',
              category: 'Rescue Equipment',
              quantity: 35,
              unit: 'units',
              storageLocation: 'Coastal Guard Staging Dock',
              status: 'Available',
              updatedAt: new Date().toISOString(),
            },
          ];
          for (const r of defaultResources) {
            await dynamoService.putItem(RESOURCES_TABLE, r, 'resourceId');
          }
          resources = defaultResources;
        }
        return createApiResponse(200, { data: resources, count: resources.length });
      }

      if (method === 'POST') {
        requireRole(authContext, ['AUTHORITY', 'ADMIN']);
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};
        const newResource: ResourceItem = {
          resourceId: uuidv4(),
          name: body.name,
          category: body.category || 'Medical',
          quantity: Number(body.quantity) || 0,
          unit: body.unit || 'units',
          storageLocation: body.storageLocation || 'Central Warehouse',
          status: body.quantity > 50 ? 'Available' : body.quantity > 0 ? 'Low Stock' : 'Depleted',
          updatedAt: new Date().toISOString(),
        };
        await dynamoService.putItem(RESOURCES_TABLE, newResource, 'resourceId');
        return createApiResponse(201, { message: 'Resource added', data: newResource });
      }
    }

    // ================= SHELTER ENDPOINTS =================
    if (method === 'GET') {
      let shelters = await dynamoService.scanItems<Shelter>(SHELTERS_TABLE);
      if (shelters.length === 0) {
        const defaultShelters: Shelter[] = [
          {
            shelterId: 'shelter-1',
            name: 'Metro City Community Stadium Shelter',
            address: '100 Stadium Way, City Center',
            latitude: 19.076,
            longitude: 72.8777,
            capacity: 500,
            currentOccupancy: 120,
            status: 'Open',
            contactPerson: 'Director Sarah Adams',
            contactPhone: '+1-555-0455',
            facilities: ['Medical Station', 'Emergency Kitchen', 'Blankets', 'Backup Power'],
            updatedAt: new Date().toISOString(),
          },
          {
            shelterId: 'shelter-2',
            name: 'East District High School Gymnasium',
            address: '42 School Rd, East District',
            latitude: 19.1136,
            longitude: 72.8697,
            capacity: 250,
            currentOccupancy: 85,
            status: 'Open',
            contactPerson: 'Principal David Miller',
            contactPhone: '+1-555-0782',
            facilities: ['Clean Water', 'Restrooms', 'Infant Care'],
            updatedAt: new Date().toISOString(),
          },
        ];
        for (const s of defaultShelters) {
          await dynamoService.putItem(SHELTERS_TABLE, s, 'shelterId');
        }
        shelters = defaultShelters;
      }
      return createApiResponse(200, { data: shelters, count: shelters.length });
    }

    if (method === 'POST') {
      requireRole(authContext, ['AUTHORITY', 'ADMIN']);
      const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};
      const newShelter: Shelter = {
        shelterId: uuidv4(),
        name: body.name,
        address: body.address,
        latitude: Number(body.latitude) || 0,
        longitude: Number(body.longitude) || 0,
        capacity: Number(body.capacity) || 100,
        currentOccupancy: Number(body.currentOccupancy) || 0,
        status: body.status || 'Open',
        contactPerson: body.contactPerson || 'Facility Manager',
        contactPhone: body.contactPhone || 'N/A',
        facilities: body.facilities || ['Water', 'Restrooms'],
        updatedAt: new Date().toISOString(),
      };
      await dynamoService.putItem(SHELTERS_TABLE, newShelter, 'shelterId');
      return createApiResponse(201, { message: 'Shelter registered', data: newShelter });
    }

    if (method === 'PUT' && pathParams?.id) {
      requireRole(authContext, ['AUTHORITY', 'ADMIN']);
      const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};
      const existing = await dynamoService.getItem<Shelter>(SHELTERS_TABLE, { shelterId: pathParams.id });
      if (!existing) {
        return createApiResponse(404, { error: 'Shelter not found' });
      }
      const updated: Shelter = {
        ...existing,
        currentOccupancy: body.currentOccupancy !== undefined ? Number(body.currentOccupancy) : existing.currentOccupancy,
        status: body.status || existing.status,
        updatedAt: new Date().toISOString(),
      };
      await dynamoService.putItem(SHELTERS_TABLE, updated, 'shelterId');
      return createApiResponse(200, { message: 'Shelter updated', data: updated });
    }

    return createApiResponse(405, { error: `Method ${method} not allowed` });
  } catch (err: any) {
    console.error('Error handling shelters/resources request:', err);
    return createApiResponse(err.message.includes('Forbidden') ? 403 : 500, {
      error: err.message || 'Internal Server Error',
    });
  }
}
