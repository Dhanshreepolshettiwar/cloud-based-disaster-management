# REST API Specification

All endpoints are hosted via Amazon API Gateway and invoke dedicated AWS Lambda functions.

Base URL (Production): `https://${DisasterApi}.execute-api.${AWS::Region}.amazonaws.com/prod`

---

## 1. Incidents API

### `GET /incidents`
Retrieve list of disaster incidents. Supports query parameters for category, severity, and status.
- **Query Parameters**:
  - `category` (optional): `Flood` | `Fire` | `Earthquake` | `Cyclone` | ...
  - `severity` (optional): `Low` | `Medium` | `High` | `Critical`
  - `status` (optional): `Reported` | `Under Review` | `Verified` | `Response Assigned` | `In Progress` | `Resolved` | `Closed`
- **Response `200 OK`**:
```json
{
  "data": [
    {
      "incidentId": "inc-001",
      "title": "Severe Flash Flooding",
      "category": "Flood",
      "severity": "Critical",
      "status": "In Progress",
      "locationName": "North Delta Sector 3",
      "latitude": 19.0825,
      "longitude": 72.889,
      "assignedTeamName": "Charlie Flood & Water Rescue",
      "mediaUrls": ["https://bucket.s3.amazonaws.com/incidents/photo.jpg"],
      "createdAt": "2026-10-17T07:00:00.000Z"
    }
  ],
  "count": 1
}
```

### `POST /incidents`
Submit a new disaster report (Citizens and Authorities).
- **Request Body**:
```json
{
  "title": "River Embankment Breach",
  "description": "Water level surging over barrier near Bridge 4",
  "category": "Flood",
  "severity": "High",
  "locationName": "Sector 14 Bridge",
  "latitude": 19.076,
  "longitude": 72.8777,
  "mediaUrls": []
}
```
- **Response `201 Created`**: Returns created `Incident` object.

### `PUT /incidents/{id}`
Update status, severity, or assign rescue team (Restricted to `AUTHORITY`, `RESCUE_TEAM`, `ADMIN`).
- **Request Body**:
```json
{
  "status": "Verified",
  "severity": "Critical",
  "assignedTeamId": "team-charlie-03",
  "assignedTeamName": "Charlie Flood & Water Rescue"
}
```

---

## 2. SOS Distress API

### `POST /sos`
Transmit immediate citizen SOS beacon.
- **Request Body**:
```json
{
  "emergencyType": "Trapped on roof by floodwaters",
  "locationDescription": "Flat 302, Green Valley Apartments",
  "latitude": 19.082,
  "longitude": 72.889,
  "peopleCount": 4,
  "requesterPhone": "+91 98765 43210"
}
```
- **Response `201 Created`**:
```json
{
  "message": "SOS request registered. Emergency rescue coordination is notified.",
  "disclaimer": "Notice: This platform does not replace official emergency numbers (911/112). Call official authorities if phone lines are accessible.",
  "data": { "sosId": "sos-911-01", "status": "Submitted" }
}
```

### `GET /sos`
Retrieve active distress requests.
- **Access**: `AUTHORITY`, `RESCUE_TEAM`, `ADMIN` (Citizens only receive their own submissions).

### `PUT /sos/{id}`
Update SOS status (`Acknowledged`, `Assigned`, `Responding`, `Resolved`).

---

## 3. Rescue Teams API

### `GET /rescue/teams`
List all registered first-responder units and their deployment statuses (`Available`, `Dispatched`, `On Scene`, `Resting`).

### `PUT /rescue/teams/{id}`
Update team readiness status or active mission ticket.

---

## 4. Emergency Alerts (Amazon SNS)

### `GET /alerts`
Retrieve active broadcast emergency alerts.

### `POST /alerts`
Broadcast emergency directive via Amazon SNS (Restricted to `AUTHORITY` and `ADMIN`).
- **Request Body**:
```json
{
  "title": "RED ALERT: Coastal Storm Surge Warning",
  "severity": "Critical",
  "affectedRegions": ["East Coast", "Low-lying wards"],
  "instructions": "Evacuate inland immediately to Metro Stadium Shelter."
}
```

---

## 5. Media Storage (Amazon S3)

### `POST /uploads/presign`
Request short-lived S3 presigned URL for direct file upload.
- **Request Body**:
```json
{
  "fileName": "damage_assessment.jpg",
  "contentType": "image/jpeg",
  "fileSize": 2048576
}
```
- **Response `200 OK`**:
```json
{
  "uploadUrl": "https://disaster-media-bucket.s3.us-east-1.amazonaws.com/incidents/...",
  "fileUrl": "https://disaster-media-bucket.s3.us-east-1.amazonaws.com/incidents/..."
}
```
