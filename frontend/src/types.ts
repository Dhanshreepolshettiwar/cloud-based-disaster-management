export type UserRole = 'CITIZEN' | 'AUTHORITY' | 'RESCUE_TEAM' | 'ADMIN';

export type RegionalScenarioId = 'mumbai' | 'odisha' | 'uttarakhand' | 'delhi' | 'gujarat';

export type Language = 'en' | 'mr' | 'hi';

export type DisasterCategory =
  | 'Flood'
  | 'Waterlogging'
  | 'Cyclone'
  | 'Landslide'
  | 'Earthquake'
  | 'Fire'
  | 'Industrial Hazard'
  | 'Building Collapse'
  | 'Heatwave'
  | 'Other Emergency';

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type IncidentStatus =
  | 'Reported'
  | 'Under Verification'
  | 'Verified'
  | 'Response Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected'
  | 'Duplicate'
  | 'Closed';

export type SOSStatus =
  | 'Submitted'
  | 'Acknowledged'
  | 'Assigned'
  | 'Responding'
  | 'Resolved'
  | 'Cancelled';

export type TeamStatus = 'Available' | 'Dispatched' | 'On Scene' | 'Resting';

export interface User {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  phoneNumber?: string;
}

export interface Incident {
  incidentId: string;
  title: string;
  description: string;
  category: DisasterCategory;
  severity: SeverityLevel;
  status: IncidentStatus;
  locationName: string;
  district?: string;
  state?: string;
  latitude: number;
  longitude: number;
  reporterId?: string;
  reporterName?: string;
  reporterContact?: string;
  peopleAffected?: number;
  assignedTeamId?: string;
  assignedTeamName?: string;
  mediaUrls?: string[];
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
  timeline?: {
    timestamp: string;
    action: string;
    actor: string;
    notes?: string;
  }[];
}

export interface SOSRequest {
  sosId: string;
  requesterName?: string;
  requesterPhone?: string;
  emergencyType: string;
  urgency: SeverityLevel;
  status: SOSStatus;
  latitude: number;
  longitude: number;
  locationDescription: string;
  district?: string;
  state?: string;
  peopleCount: number;
  specialNeeds?: string[];
  assignedTeamId?: string;
  assignedTeamName?: string;
  notes?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RescueTeam {
  teamId: string;
  name: string;
  agency: string; // e.g. "NDRF", "SDRF", "MCGM Disaster Cell", "Fire Brigade"
  specialization: 'Medical' | 'Water Rescue' | 'Fire & Hazard' | 'Search & Rescue' | 'Logistics';
  contactPhone: string;
  currentStatus: TeamStatus;
  assignedIncidentId?: string;
  assignedSOSId?: string;
  baseLocation: string;
  membersCount: number;
  lastUpdated: string;
}

export interface Shelter {
  shelterId: string;
  name: string;
  address: string;
  locality: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  capacity: number;
  currentOccupancy: number;
  status: 'Open' | 'Full' | 'Temporarily Closed' | 'Unverified';
  contactPerson: string;
  contactPhone: string;
  facilities: string[];
  hasMedicalSupport?: boolean;
  isWheelchairAccessible?: boolean;
  isDemo?: boolean;
  updatedAt: string;
}

export interface ResourceItem {
  resourceId: string;
  name: string;
  category: 'Medical' | 'Food & Water' | 'Rescue Equipment' | 'Bedding & Shelter' | 'Power & Fuel';
  quantity: number;
  unit: string; // e.g. "kits", "liters", "boats", "blankets", "meals", "pumps"
  storageLocation: string;
  reorderThreshold: number;
  status: 'Available' | 'Low Stock' | 'Depleted';
  expiryDate?: string;
  lastDispatched?: string;
  updatedAt: string;
}

export type AlertSourceType = 'Official IMD / CWC' | 'State / District DMA' | 'Control Room Operator' | 'Simulated Demonstration';

export interface EmergencyAlert {
  alertId: string;
  title: string;
  severity: SeverityLevel;
  disasterType: DisasterCategory;
  affectedRegions: string[];
  instructions: string;
  issuedBy: string;
  sourceType: AlertSourceType;
  issuedAt: string;
  updatedAt?: string;
  active: boolean;
  recommendedActions: string[];
  isDemo?: boolean;
  snsMessageId?: string;
}

export interface DashboardStats {
  totalIncidents: number;
  activeIncidents: number;
  criticalIncidents: number;
  openSOSRequests: number;
  incidentsAwaitingReview: number;
  peopleAffectedCount: number;
  teamsDispatched: number;
  totalTeams: number;
  resolvedIncidents: number;
  shelterCapacityTotal: number;
  shelterOccupancyTotal: number;
  shelterAvailableSlots: number;
  lowStockItemsCount: number;
}

export interface RegionalScenario {
  id: RegionalScenarioId;
  name: string;
  state: string;
  center: [number, number];
  zoom: number;
  hazardTitle: string;
  scenarioDescription: string;
  activeAlert: EmergencyAlert;
  incidents: Incident[];
  shelters: Shelter[];
  teams: RescueTeam[];
  resources: ResourceItem[];
}
