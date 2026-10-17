# Amazon DynamoDB Data Model & Query Patterns

The platform implements Amazon DynamoDB tables configured with **Pay-Per-Request (On-Demand)** billing mode, ensuring zero base charges while automatically scaling to handle sudden disaster traffic spikes.

---

## 1. Table Definitions

### Table 1: `disaster_incidents`
Stores disaster incident reports, status progression history, and geolocation.
- **Partition Key (`HASH`)**: `incidentId` (String, UUID)
- **Global Secondary Index 1**: `StatusIndex`
  - **Partition Key**: `status` (String)
  - **Sort Key**: `createdAt` (String, ISO8601)
  - **Projection**: `ALL`
  - **Access Pattern**: Enables fetching all active, verified, or in-progress incidents sorted chronologically without performing full table scans.

#### Attributes:
| Attribute | Type | Description |
| :--- | :--- | :--- |
| `incidentId` | String | Unique incident UUID |
| `title` | String | Incident title |
| `description` | String | Detailed report |
| `category` | String | Flood, Fire, Earthquake, Cyclone, etc. |
| `severity` | String | Low, Medium, High, Critical |
| `status` | String | Reported, Under Review, Verified, Response Assigned, In Progress, Resolved, Closed |
| `locationName` | String | Locality / Sector name |
| `latitude` | Number | WGS84 GPS latitude |
| `longitude` | Number | WGS84 GPS longitude |
| `reporterName` | String | Citizen or Authority reporter |
| `reporterContact`| String | Contact phone / email |
| `assignedTeamId`| String | Dispatched rescue team ID |
| `assignedTeamName`| String | Dispatched rescue team name |
| `mediaUrls` | List | S3 URLs of uploaded disaster photos |
| `timeline` | List | Chronological audit trail of all status updates |
| `createdAt` | String | ISO8601 Timestamp |
| `updatedAt` | String | ISO8601 Timestamp |

---

### Table 2: `disaster_sos`
Stores high-priority citizen distress beacons.
- **Partition Key (`HASH`)**: `sosId` (String, UUID)
- **Global Secondary Index 1**: `SOSStatusIndex`
  - **Partition Key**: `status` (String)
  - **Sort Key**: `createdAt` (String, ISO8601)
  - **Projection**: `ALL`
  - **Access Pattern**: Allows dispatch authorities to query open distress calls ordered by urgency.

---

### Table 3: `disaster_rescue_teams`
Stores first-responder units and field deployment readiness.
- **Partition Key (`HASH`)**: `teamId` (String)
- **Attributes**: `name`, `specialization`, `contactPhone`, `currentStatus` (`Available`, `Dispatched`, `On Scene`, `Resting`), `assignedIncidentId`, `baseLocation`, `membersCount`, `lastUpdated`.

---

### Table 4: `disaster_shelters`
Stores emergency shelters and occupancy stats.
- **Partition Key (`HASH`)**: `shelterId` (String)
- **Attributes**: `name`, `address`, `latitude`, `longitude`, `capacity`, `currentOccupancy`, `status` (`Open`, `Full`, `Closed`), `contactPerson`, `contactPhone`, `facilities`, `updatedAt`.

---

### Table 5: `disaster_resources`
Stores emergency relief inventory (medical kits, rations, rescue boats).
- **Partition Key (`HASH`)**: `resourceId` (String)
- **Attributes**: `name`, `category`, `quantity`, `unit`, `storageLocation`, `status`, `updatedAt`.

---

### Table 6: `disaster_alerts`
Stores official emergency broadcasts transmitted via Amazon SNS.
- **Partition Key (`HASH`)**: `alertId` (String)
- **Attributes**: `title`, `severity`, `affectedRegions`, `instructions`, `issuedBy`, `issuedAt`, `active`, `snsMessageId`.
