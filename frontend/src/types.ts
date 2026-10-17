export type UserRole = 'CITIZEN' | 'AUTHORITY' | 'RESCUE_TEAM' | 'ADMIN';

export type DisasterCategory =
  | 'Flood'
  | 'Earthquake'
  | 'Fire'
  | 'Cyclone'
  | 'Landslide'
  | 'Industrial Accident'
  | 'Building Collapse'
  | 'Other Emergency';

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type IncidentStatus =
  | 'Reported'
  | 'Under Review'
  | 'Verified'
  | 'Response Assigned'
  | 'In Progress'
  | 'Resolved'
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
  latitude: number;
  longitude: number;
  reporterId?: string;
  reporterName?: string;
  reporterContact?: string;
  assignedTeamId?: string;
  assignedTeamName?: string;
  mediaUrls?: string[];
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
  peopleCount: number;
  assignedTeamId?: string;
  assignedTeamName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RescueTeam {
  teamId: string;
  name: string;
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
  latitude: number;
  longitude: number;
  capacity: number;
  currentOccupancy: number;
  status: 'Open' | 'Full' | 'Closed';
  contactPerson: string;
  contactPhone: string;
  facilities: string[];
  updatedAt: string;
}

export interface ResourceItem {
  resourceId: string;
  name: string;
  category: 'Medical' | 'Food & Water' | 'Rescue Equipment' | 'Bedding & Shelter' | 'Power & Fuel';
  quantity: number;
  unit: string;
  storageLocation: string;
  status: 'Available' | 'Low Stock' | 'Depleted';
  updatedAt: string;
}

export interface EmergencyAlert {
  alertId: string;
  title: string;
  severity: SeverityLevel;
  affectedRegions: string[];
  instructions: string;
  issuedBy: string;
  issuedAt: string;
  active: boolean;
  snsMessageId?: string;
}

export interface DashboardStats {
  totalIncidents: number;
  activeIncidents: number;
  criticalIncidents: number;
  openSOSRequests: number;
  incidentsAwaitingReview: number;
  teamsDispatched: number;
  resolvedIncidents: number;
  shelterCapacityTotal: number;
  shelterOccupancyTotal: number;
  shelterAvailableSlots: number;
}
