import { describe, it } from 'node:test';
import assert from 'node:assert';
import { handler as incidentsHandler } from '../handlers/incidents';
import { handler as sosHandler } from '../handlers/sos';
import { handler as rescueHandler } from '../handlers/rescue';
import { handler as sheltersHandler } from '../handlers/shelters';
import { handler as alertsHandler } from '../handlers/alerts';
import { handler as statsHandler } from '../handlers/stats';
import { handler as uploadsHandler } from '../handlers/uploads';

describe('Disaster Management Backend Handlers Test Suite', () => {
  it('should create and retrieve an incident', async () => {
    // 1. Create incident
    const postRes = await incidentsHandler({
      httpMethod: 'POST',
      body: JSON.stringify({
        title: 'Severe River Flash Flood',
        description: 'Water rising near east bridge, 50 households evacuated',
        category: 'Flood',
        severity: 'High',
        locationName: 'East Bridge Delta',
        latitude: 19.076,
        longitude: 72.877,
      }),
      headers: {
        'x-user-role': 'CITIZEN',
        'x-user-id': 'user-123',
        'x-user-name': 'John Citizen',
      },
    });

    assert.strictEqual(postRes.statusCode, 201);
    const postBody = JSON.parse(postRes.body);
    assert.ok(postBody.data.incidentId);
    assert.strictEqual(postBody.data.status, 'Reported');

    // 2. Retrieve incidents
    const getRes = await incidentsHandler({
      httpMethod: 'GET',
      queryStringParameters: { category: 'Flood' },
    });
    assert.strictEqual(getRes.statusCode, 200);
    const getBody = JSON.parse(getRes.body);
    assert.ok(getBody.data.length > 0);
  });

  it('should reject unauthorized incident status changes from citizens', async () => {
    const res = await incidentsHandler({
      httpMethod: 'PUT',
      pathParameters: { id: 'any-id' },
      body: JSON.stringify({ status: 'Verified' }),
      headers: {
        'x-user-role': 'CITIZEN',
      },
    });
    // Forbidden
    assert.strictEqual(res.statusCode, 403);
  });

  it('should submit and list SOS emergency requests with disclaimers', async () => {
    const sosRes = await sosHandler({
      httpMethod: 'POST',
      body: JSON.stringify({
        emergencyType: 'Trapped on rooftop due to floodwaters',
        locationDescription: '45 Lakeview Apt, 3rd Floor',
        peopleCount: 4,
        urgency: 'Critical',
        requesterPhone: '+1-555-9988',
      }),
      headers: {
        'x-user-role': 'CITIZEN',
        'x-user-name': 'Emergency Requester',
      },
    });

    assert.strictEqual(sosRes.statusCode, 201);
    const sosBody = JSON.parse(sosRes.body);
    assert.ok(sosBody.disclaimer.includes('911/112'));
    assert.strictEqual(sosBody.data.status, 'Submitted');
  });

  it('should retrieve rescue teams and shelters', async () => {
    const teamsRes = await rescueHandler({ httpMethod: 'GET' });
    assert.strictEqual(teamsRes.statusCode, 200);
    const teamsBody = JSON.parse(teamsRes.body);
    assert.ok(teamsBody.data.length >= 3);

    const sheltersRes = await sheltersHandler({ httpMethod: 'GET', path: '/shelters' });
    assert.strictEqual(sheltersRes.statusCode, 200);
    const sheltersBody = JSON.parse(sheltersRes.body);
    assert.ok(sheltersBody.data.length >= 2);
  });

  it('should issue emergency alerts via SNS and record in database', async () => {
    const alertRes = await alertsHandler({
      httpMethod: 'POST',
      body: JSON.stringify({
        title: 'Tsunami Warning for Coastal Strip',
        severity: 'Critical',
        affectedRegions: ['Sector A', 'Sector B'],
        instructions: 'Immediate evacuation inland to elevated ground.',
      }),
      headers: {
        'x-user-role': 'AUTHORITY',
        'x-user-name': 'Chief Controller',
      },
    });

    assert.strictEqual(alertRes.statusCode, 201);
    const alertBody = JSON.parse(alertRes.body);
    assert.ok(alertBody.data.snsMessageId);
  });

  it('should generate presigned S3 upload URL for valid image file', async () => {
    const uploadRes = await uploadsHandler({
      httpMethod: 'POST',
      body: JSON.stringify({
        fileName: 'flood_damage_photo.jpg',
        contentType: 'image/jpeg',
        fileSize: 204800,
      }),
      headers: {
        'x-user-id': 'user-reporter',
      },
    });

    assert.strictEqual(uploadRes.statusCode, 200);
    const uploadBody = JSON.parse(uploadRes.body);
    assert.ok(uploadBody.uploadUrl);
    assert.ok(uploadBody.objectKey.startsWith('incidents/'));
  });

  it('should calculate live operational dashboard statistics', async () => {
    const statsRes = await statsHandler({ httpMethod: 'GET' });
    assert.strictEqual(statsRes.statusCode, 200);
    const statsBody = JSON.parse(statsRes.body);
    assert.ok(statsBody.data.totalIncidents >= 1);
    assert.ok(statsBody.data.openSOSRequests >= 1);
    assert.ok(statsBody.data.shelterCapacityTotal > 0);
  });
});
