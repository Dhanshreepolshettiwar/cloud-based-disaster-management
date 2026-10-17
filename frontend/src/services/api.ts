import {
  Incident,
  SOSRequest,
  RescueTeam,
  Shelter,
  ResourceItem,
  EmergencyAlert,
  DashboardStats,
  UserRole,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

// Default mock initial data for local development and offline demonstrations
const initialIncidents: Incident[] = [
  {
    incidentId: 'inc-001',
    title: 'Severe Flash Flooding & River Embankment Breach',
    description: 'Heavy precipitation caused river embankment failure. Flood waters reaching ground floors of residential buildings. Around 40 residents stranded.',
    category: 'Flood',
    severity: 'Critical',
    status: 'In Progress',
    locationName: 'North Delta Sector 3, Riverbank Road',
    latitude: 19.0825,
    longitude: 72.889,
    reporterId: 'usr-cit-1',
    reporterName: 'Aarav Sharma',
    reporterContact: '+91 98200 11223',
    assignedTeamId: 'team-charlie-03',
    assignedTeamName: 'Charlie Flood & Water Rescue',
    mediaUrls: [
      'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
    ],
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    timeline: [
      {
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        action: 'Reported',
        actor: 'Aarav Sharma (Citizen)',
        notes: 'Initial emergency incident reported with photo attachments.',
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        action: 'Verified & Severity Escalated to Critical',
        actor: 'Command Control (Authority)',
        notes: 'Disaster assessment verified drone aerial feed.',
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        action: 'Assigned to Charlie Flood & Water Rescue',
        actor: 'Dispatch HQ (Authority)',
        notes: 'Three rescue boats dispatched with lifejackets.',
      },
    ],
  },
  {
    incidentId: 'inc-002',
    title: 'Commercial Chemical Warehouse Blaze',
    description: 'Electrical short circuit triggered industrial warehouse fire with dense toxic smoke plumes spreading toward nearby residential sectors.',
    category: 'Fire',
    severity: 'High',
    status: 'Verified',
    locationName: 'West Industrial Estate, Bay 14',
    latitude: 19.113,
    longitude: 72.869,
    reporterId: 'usr-cit-2',
    reporterName: 'Meera Patel',
    reporterContact: '+91 98111 22334',
    assignedTeamId: 'team-bravo-02',
    assignedTeamName: 'Bravo Urban Search & Rescue',
    mediaUrls: [
      'https://images.unsplash.com/photo-1579208575657-c595a05383b7?auto=format&fit=crop&w=600&q=80',
    ],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    timeline: [
      {
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        action: 'Reported',
        actor: 'Meera Patel (Citizen)',
        notes: 'Thick black smoke detected in chemical storage zone.',
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        action: 'Verified',
        actor: 'Fire Marshall Office (Authority)',
        notes: 'Hazardous material protocol Hazmat Stage 2 activated.',
      },
    ],
  },
  {
    incidentId: 'inc-003',
    title: 'Earthquake Tremor & Structural Masonry Cracks',
    description: 'Magnitude 5.2 seismic tremor reported. Two older commercial complexes exhibiting significant wall fissures. Perimeter cordoned off.',
    category: 'Earthquake',
    severity: 'Medium',
    status: 'Under Review',
    locationName: 'Heritage Market Square, Block B',
    latitude: 19.055,
    longitude: 72.84,
    reporterId: 'usr-cit-3',
    reporterName: 'Karan Verma',
    reporterContact: '+91 97654 32100',
    mediaUrls: [],
    createdAt: new Date(Date.now() - 3600000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 7).toISOString(),
    timeline: [
      {
        timestamp: new Date(Date.now() - 3600000 * 7).toISOString(),
        action: 'Reported',
        actor: 'Karan Verma (Citizen)',
        notes: 'Pedestrian plaza evacuated following tremor vibrations.',
      },
    ],
  },
];

const initialSOS: SOSRequest[] = [
  {
    sosId: 'sos-911-01',
    requesterName: 'Pooja Deshmukh',
    requesterPhone: '+91 99300 44556',
    emergencyType: 'Trapped on 2nd Floor Balcony - Rapid Water Influx',
    urgency: 'Critical',
    status: 'Responding',
    latitude: 19.081,
    longitude: 72.888,
    locationDescription: 'Building 4, Sector 3, near Sun Temple',
    peopleCount: 4,
    assignedTeamId: 'team-charlie-03',
    assignedTeamName: 'Charlie Flood & Water Rescue',
    notes: '2 elderly citizens requiring stretcher assistance.',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 600000).toISOString(),
  },
  {
    sosId: 'sos-911-02',
    requesterName: 'Anonymous Citizen',
    requesterPhone: '+91 98450 77889',
    emergencyType: 'Gas Leak & Breathing Difficulties',
    urgency: 'High',
    status: 'Acknowledged',
    latitude: 19.115,
    longitude: 72.871,
    locationDescription: 'Opposite Industrial Gate 2',
    peopleCount: 2,
    notes: 'Dispatched hazmat medical ambulance.',
    createdAt: new Date(Date.now() - 2700000).toISOString(),
    updatedAt: new Date(Date.now() - 1200000).toISOString(),
  },
];

const initialTeams: RescueTeam[] = [
  {
    teamId: 'team-alpha-01',
    name: 'Alpha Rapid Medical Unit',
    specialization: 'Medical',
    contactPhone: '+91 98200 99001',
    currentStatus: 'Available',
    baseLocation: 'Central Emergency Hospital Trauma Wing',
    membersCount: 8,
    lastUpdated: new Date().toISOString(),
  },
  {
    teamId: 'team-bravo-02',
    name: 'Bravo Urban Search & Rescue',
    specialization: 'Search & Rescue',
    contactPhone: '+91 98200 99002',
    currentStatus: 'Dispatched',
    assignedIncidentId: 'inc-002',
    baseLocation: 'District Fire Station 4',
    membersCount: 12,
    lastUpdated: new Date().toISOString(),
  },
  {
    teamId: 'team-charlie-03',
    name: 'Charlie Flood & Water Rescue',
    specialization: 'Water Rescue',
    contactPhone: '+91 98200 99003',
    currentStatus: 'On Scene',
    assignedIncidentId: 'inc-001',
    assignedSOSId: 'sos-911-01',
    baseLocation: 'Coastal Harbor Depot',
    membersCount: 10,
    lastUpdated: new Date().toISOString(),
  },
];

const initialShelters: Shelter[] = [
  {
    shelterId: 'shelter-01',
    name: 'Metro City Sports Arena Emergency Shelter',
    address: '100 Stadium Way, Civil Lines',
    latitude: 19.076,
    longitude: 72.8777,
    capacity: 600,
    currentOccupancy: 210,
    status: 'Open',
    contactPerson: 'Director Sarah Adams',
    contactPhone: '+91 22 2456 7890',
    facilities: ['Medical Dispensary', 'Emergency Kitchen', 'Power Generators', 'Sanitation Blocks'],
    updatedAt: new Date().toISOString(),
  },
  {
    shelterId: 'shelter-02',
    name: 'Hilltop High School & Community Center',
    address: '45 Ridge View Road, Elevated Sector',
    latitude: 19.125,
    longitude: 72.86,
    capacity: 350,
    currentOccupancy: 140,
    status: 'Open',
    contactPerson: 'Principal David Miller',
    contactPhone: '+91 22 2890 1234',
    facilities: ['Clean Potable Water', 'Blankets', 'Infant Care Station'],
    updatedAt: new Date().toISOString(),
  },
];

const initialResources: ResourceItem[] = [
  {
    resourceId: 'res-01',
    name: 'Emergency Trauma Medical Kits',
    category: 'Medical',
    quantity: 320,
    unit: 'kits',
    storageLocation: 'Central Emergency Depot Bay 3',
    status: 'Available',
    updatedAt: new Date().toISOString(),
  },
  {
    resourceId: 'res-02',
    name: 'High-Volume Water Purification Pouches',
    category: 'Food & Water',
    quantity: 8500,
    unit: 'liters',
    storageLocation: 'Northern Relief Depot',
    status: 'Available',
    updatedAt: new Date().toISOString(),
  },
  {
    resourceId: 'res-03',
    name: 'Inflatable Rescue Boats & Outboard Motors',
    category: 'Rescue Equipment',
    quantity: 18,
    unit: 'boats',
    storageLocation: 'Harbor Rescue Depot',
    status: 'Available',
    updatedAt: new Date().toISOString(),
  },
  {
    resourceId: 'res-04',
    name: 'Heavy Duty Emergency Generators (15kVA)',
    category: 'Power & Fuel',
    quantity: 22,
    unit: 'units',
    storageLocation: 'Civil Engineering Yard',
    status: 'Available',
    updatedAt: new Date().toISOString(),
  },
];

const initialAlerts: EmergencyAlert[] = [
  {
    alertId: 'alert-001',
    title: 'RED ALERT: Severe Flash Floods & High Tide Advisory',
    severity: 'Critical',
    affectedRegions: ['North Delta Sector 3', 'Riverbank Corridor', 'Low-Lying Coastal Roads'],
    instructions: 'Evacuate ground level premises immediately. Do not attempt to cross flooded roadways. Proceed to Metro Sports Arena Shelter.',
    issuedBy: 'Disaster Management Authority',
    issuedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    active: true,
    snsMessageId: 'sns-arn-disaster-broadcast-001',
  },
];

// Persistent local state in browser storage
class MockStorageService {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(`disaster_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`disaster_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  getIncidents(): Incident[] {
    return this.get<Incident[]>('incidents', initialIncidents);
  }

  saveIncidents(items: Incident[]) {
    this.set('incidents', items);
  }

  getSOS(): SOSRequest[] {
    return this.get<SOSRequest[]>('sos', initialSOS);
  }

  saveSOS(items: SOSRequest[]) {
    this.set('sos', items);
  }

  getTeams(): RescueTeam[] {
    return this.get<RescueTeam[]>('teams', initialTeams);
  }

  saveTeams(items: RescueTeam[]) {
    this.set('teams', items);
  }

  getShelters(): Shelter[] {
    return this.get<Shelter[]>('shelters', initialShelters);
  }

  saveShelters(items: Shelter[]) {
    this.set('shelters', items);
  }

  getResources(): ResourceItem[] {
    return this.get<ResourceItem[]>('resources', initialResources);
  }

  saveResources(items: ResourceItem[]) {
    this.set('resources', items);
  }

  getAlerts(): EmergencyAlert[] {
    return this.get<EmergencyAlert[]>('alerts', initialAlerts);
  }

  saveAlerts(items: EmergencyAlert[]) {
    this.set('alerts', items);
  }
}

const mockStore = new MockStorageService();

export const apiService = {
  // INCIDENTS
  async getIncidents(filters?: { category?: string; severity?: string; status?: string }): Promise<Incident[]> {
    if (API_BASE) {
      const query = new URLSearchParams(filters as any).toString();
      const res = await fetch(`${API_BASE}/incidents?${query}`);
      const json = await res.json();
      return json.data || [];
    }

    let list = mockStore.getIncidents();
    if (filters?.category) list = list.filter((i) => i.category === filters.category);
    if (filters?.severity) list = list.filter((i) => i.severity === filters.severity);
    if (filters?.status) list = list.filter((i) => i.status === filters.status);
    return list;
  },

  async createIncident(incidentData: Partial<Incident>, userRole: UserRole, userName: string): Promise<Incident> {
    if (API_BASE) {
      const res = await fetch(`${API_BASE}/incidents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole,
          'x-user-name': userName,
        },
        body: JSON.stringify(incidentData),
      });
      const json = await res.json();
      return json.data;
    }

    const now = new Date().toISOString();
    const newInc: Incident = {
      incidentId: `inc-${Date.now().toString(36)}`,
      title: incidentData.title || 'Untitled Incident',
      description: incidentData.description || '',
      category: incidentData.category || 'Other Emergency',
      severity: incidentData.severity || 'Medium',
      status: 'Reported',
      locationName: incidentData.locationName || 'Location Not Specified',
      latitude: incidentData.latitude || 19.076,
      longitude: incidentData.longitude || 72.8777,
      reporterName: userName,
      reporterContact: incidentData.reporterContact || '',
      mediaUrls: incidentData.mediaUrls || [],
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          timestamp: now,
          action: 'Reported',
          actor: `${userName} (${userRole})`,
          notes: 'Incident recorded via platform.',
        },
      ],
    };

    const current = mockStore.getIncidents();
    mockStore.saveIncidents([newInc, ...current]);
    return newInc;
  },

  async updateIncident(
    incidentId: string,
    updates: Partial<Incident>,
    userRole: UserRole,
    userName: string
  ): Promise<Incident> {
    if (API_BASE) {
      const res = await fetch(`${API_BASE}/incidents/${incidentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole,
          'x-user-name': userName,
        },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      return json.data;
    }

    const current = mockStore.getIncidents();
    const idx = current.findIndex((i) => i.incidentId === incidentId);
    if (idx === -1) throw new Error('Incident not found');

    const now = new Date().toISOString();
    const updated: Incident = {
      ...current[idx],
      ...updates,
      updatedAt: now,
      timeline: [
        ...(current[idx].timeline || []),
        {
          timestamp: now,
          action: updates.status ? `Status changed to ${updates.status}` : 'Incident updated',
          actor: `${userName} (${userRole})`,
          notes: (updates as any).notes || 'Operational update logged.',
        },
      ],
    };

    current[idx] = updated;
    mockStore.saveIncidents(current);
    return updated;
  },

  // SOS REQUESTS
  async getSOSRequests(): Promise<SOSRequest[]> {
    if (API_BASE) {
      const res = await fetch(`${API_BASE}/sos`);
      const json = await res.json();
      return json.data || [];
    }
    return mockStore.getSOS();
  },

  async submitSOS(sosData: Partial<SOSRequest>, userName: string): Promise<SOSRequest> {
    if (API_BASE) {
      const res = await fetch(`${API_BASE}/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sosData),
      });
      const json = await res.json();
      return json.data;
    }

    const now = new Date().toISOString();
    const newSOS: SOSRequest = {
      sosId: `sos-${Date.now().toString(36)}`,
      requesterName: userName || 'Anonymous Citizen',
      requesterPhone: sosData.requesterPhone || '',
      emergencyType: sosData.emergencyType || 'Life-Threatening Emergency',
      urgency: sosData.urgency || 'Critical',
      status: 'Submitted',
      latitude: sosData.latitude || 19.08,
      longitude: sosData.longitude || 72.88,
      locationDescription: sosData.locationDescription || 'Urgent rescue location',
      peopleCount: sosData.peopleCount || 1,
      notes: sosData.notes || '',
      createdAt: now,
      updatedAt: now,
    };

    const current = mockStore.getSOS();
    mockStore.saveSOS([newSOS, ...current]);
    return newSOS;
  },

  async updateSOSStatus(
    sosId: string,
    status: SOSRequest['status'],
    assignedTeamName?: string,
    notes?: string
  ): Promise<SOSRequest> {
    if (API_BASE) {
      const res = await fetch(`${API_BASE}/sos/${sosId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-role': 'AUTHORITY' },
        body: JSON.stringify({ status, assignedTeamName, notes }),
      });
      const json = await res.json();
      return json.data;
    }

    const current = mockStore.getSOS();
    const idx = current.findIndex((s) => s.sosId === sosId);
    if (idx === -1) throw new Error('SOS request not found');

    const updated: SOSRequest = {
      ...current[idx],
      status,
      assignedTeamName: assignedTeamName !== undefined ? assignedTeamName : current[idx].assignedTeamName,
      notes: notes ? `${current[idx].notes || ''}\n${notes}` : current[idx].notes,
      updatedAt: new Date().toISOString(),
    };

    current[idx] = updated;
    mockStore.saveSOS(current);
    return updated;
  },

  // RESCUE TEAMS
  async getRescueTeams(): Promise<RescueTeam[]> {
    if (API_BASE) {
      const res = await fetch(`${API_BASE}/rescue/teams`);
      const json = await res.json();
      return json.data || [];
    }
    return mockStore.getTeams();
  },

  async updateTeamStatus(teamId: string, status: RescueTeam['currentStatus']): Promise<RescueTeam> {
    if (API_BASE) {
      const res = await fetch(`${API_BASE}/rescue/teams/${teamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-role': 'RESCUE_TEAM' },
        body: JSON.stringify({ currentStatus: status }),
      });
      const json = await res.json();
      return json.data;
    }

    const current = mockStore.getTeams();
    const idx = current.findIndex((t) => t.teamId === teamId);
    if (idx === -1) throw new Error('Team not found');

    current[idx].currentStatus = status;
    current[idx].lastUpdated = new Date().toISOString();
    mockStore.saveTeams(current);
    return current[idx];
  },

  // SHELTERS & RESOURCES
  async getShelters(): Promise<Shelter[]> {
    if (API_BASE) {
      const res = await fetch(`${API_BASE}/shelters`);
      const json = await res.json();
      return json.data || [];
    }
    return mockStore.getShelters();
  },

  async updateShelterOccupancy(shelterId: string, newOccupancy: number): Promise<Shelter> {
    const current = mockStore.getShelters();
    const idx = current.findIndex((s) => s.shelterId === shelterId);
    if (idx !== -1) {
      current[idx].currentOccupancy = newOccupancy;
      current[idx].status = newOccupancy >= current[idx].capacity ? 'Full' : 'Open';
      current[idx].updatedAt = new Date().toISOString();
      mockStore.saveShelters(current);
      return current[idx];
    }
    throw new Error('Shelter not found');
  },

  async getResources(): Promise<ResourceItem[]> {
    if (API_BASE) {
      const res = await fetch(`${API_BASE}/resources`);
      const json = await res.json();
      return json.data || [];
    }
    return mockStore.getResources();
  },

  // EMERGENCY ALERTS
  async getAlerts(): Promise<EmergencyAlert[]> {
    if (API_BASE) {
      const res = await fetch(`${API_BASE}/alerts`);
      const json = await res.json();
      return json.data || [];
    }
    return mockStore.getAlerts();
  },

  async broadcastAlert(alertData: Partial<EmergencyAlert>, userName: string): Promise<EmergencyAlert> {
    if (API_BASE) {
      const res = await fetch(`${API_BASE}/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-role': 'AUTHORITY', 'x-user-name': userName },
        body: JSON.stringify(alertData),
      });
      const json = await res.json();
      return json.data;
    }

    const newAlert: EmergencyAlert = {
      alertId: `alert-${Date.now().toString(36)}`,
      title: alertData.title || 'Emergency Broadcast',
      severity: alertData.severity || 'High',
      affectedRegions: alertData.affectedRegions || ['All Sectors'],
      instructions: alertData.instructions || 'Stay tuned to official disaster broadcasts.',
      issuedBy: `${userName} (Disaster Command)`,
      issuedAt: new Date().toISOString(),
      active: true,
      snsMessageId: `mock-sns-${Date.now()}`,
    };

    const current = mockStore.getAlerts();
    mockStore.saveAlerts([newAlert, ...current]);
    return newAlert;
  },

  // S3 PRESIGNED UPLOAD
  async getPresignedUploadUrl(fileName: string, contentType: string, fileSize: number) {
    if (API_BASE) {
      const res = await fetch(`${API_BASE}/uploads/presign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, contentType, fileSize }),
      });
      return await res.json();
    }

    return {
      uploadUrl: 'https://mock-s3-upload.local',
      fileUrl: URL.createObjectURL(new Blob(['mock-image-data'], { type: contentType })),
      objectKey: `incidents/${Date.now()}-${fileName}`,
    };
  },

  // DASHBOARD STATS
  async getDashboardStats(): Promise<DashboardStats> {
    if (API_BASE) {
      const res = await fetch(`${API_BASE}/stats`);
      const json = await res.json();
      return json.data;
    }

    const incidents = mockStore.getIncidents();
    const sos = mockStore.getSOS();
    const teams = mockStore.getTeams();
    const shelters = mockStore.getShelters();

    const activeIncidents = incidents.filter((i) => i.status !== 'Resolved' && i.status !== 'Closed').length;
    const criticalIncidents = incidents.filter(
      (i) => i.severity === 'Critical' && i.status !== 'Resolved' && i.status !== 'Closed'
    ).length;
    const openSOSRequests = sos.filter((s) => s.status !== 'Resolved' && s.status !== 'Cancelled').length;
    const incidentsAwaitingReview = incidents.filter((i) => i.status === 'Reported' || i.status === 'Under Review').length;
    const teamsDispatched = teams.filter((t) => t.currentStatus === 'Dispatched' || t.currentStatus === 'On Scene').length;
    const resolvedIncidents = incidents.filter((i) => i.status === 'Resolved' || i.status === 'Closed').length;

    const shelterCapacityTotal = shelters.reduce((acc, s) => acc + s.capacity, 0);
    const shelterOccupancyTotal = shelters.reduce((acc, s) => acc + s.currentOccupancy, 0);
    const shelterAvailableSlots = Math.max(0, shelterCapacityTotal - shelterOccupancyTotal);

    return {
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
  },
};
