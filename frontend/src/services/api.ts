import {
  Incident,
  SOSRequest,
  RescueTeam,
  Shelter,
  ResourceItem,
  EmergencyAlert,
  DashboardStats,
  UserRole,
  RegionalScenarioId,
  RegionalScenario,
} from '../types';
import { REGIONAL_SCENARIOS } from './scenarios';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

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

  getActiveScenarioId(): RegionalScenarioId {
    return this.get<RegionalScenarioId>('active_scenario', 'mumbai');
  }

  setActiveScenarioId(id: RegionalScenarioId): void {
    this.set('active_scenario', id);
  }

  getScenario(id?: RegionalScenarioId): RegionalScenario {
    const activeId = id || this.getActiveScenarioId();
    return REGIONAL_SCENARIOS[activeId] || REGIONAL_SCENARIOS.mumbai;
  }

  getIncidents(scenarioId?: RegionalScenarioId): Incident[] {
    const scId = scenarioId || this.getActiveScenarioId();
    const defaultData = (REGIONAL_SCENARIOS[scId] || REGIONAL_SCENARIOS.mumbai).incidents;
    return this.get<Incident[]>(`incidents_${scId}`, defaultData);
  }

  saveIncidents(items: Incident[], scenarioId?: RegionalScenarioId): void {
    const scId = scenarioId || this.getActiveScenarioId();
    this.set(`incidents_${scId}`, items);
  }

  getSOS(scenarioId?: RegionalScenarioId): SOSRequest[] {
    const scId = scenarioId || this.getActiveScenarioId();
    const defaultSOS: SOSRequest[] = [
      {
        sosId: 'SOS-MH-BOM-911',
        requesterName: 'Aarti Patil',
        requesterPhone: '+91 98200 44556',
        emergencyType: 'Trapped in waterlogged residential ground-floor chawl',
        urgency: 'Critical',
        status: 'Acknowledged',
        latitude: 19.0765,
        longitude: 72.8835,
        locationDescription: 'Room 14, Kranti Nagar Chawl No. 4, Kurla West',
        district: 'Mumbai Suburban',
        state: 'Maharashtra',
        peopleCount: 4,
        specialNeeds: ['Elderly grandmother (bedridden)', 'Infant (8 months old)'],
        assignedTeamId: 'team-ndrf-mumbai-01',
        assignedTeamName: 'NDRF 5th Battalion (Flood Rescue Alpha)',
        notes: 'Water level inside room reaching 2.5 feet. Family moved to wooden cot.',
        isDemo: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      },
      {
        sosId: 'SOS-MH-BOM-912',
        requesterName: 'Ramesh Verma',
        requesterPhone: '+91 98201 99881',
        emergencyType: 'Submerged vehicle engine stall near flood drain',
        urgency: 'High',
        status: 'Submitted',
        latitude: 19.041,
        longitude: 72.8635,
        locationDescription: 'Beside Gandhi Market bus depot, Sion',
        district: 'Mumbai City',
        state: 'Maharashtra',
        peopleCount: 2,
        specialNeeds: [],
        notes: 'Vehicle surrounded by 3 feet stagnant stormwater; no electrical hazard seen.',
        isDemo: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      },
    ];
    return this.get<SOSRequest[]>(`sos_${scId}`, defaultSOS);
  }

  saveSOS(items: SOSRequest[], scenarioId?: RegionalScenarioId): void {
    const scId = scenarioId || this.getActiveScenarioId();
    this.set(`sos_${scId}`, items);
  }

  getTeams(scenarioId?: RegionalScenarioId): RescueTeam[] {
    const scId = scenarioId || this.getActiveScenarioId();
    const defaultData = (REGIONAL_SCENARIOS[scId] || REGIONAL_SCENARIOS.mumbai).teams;
    return this.get<RescueTeam[]>(`teams_${scId}`, defaultData);
  }

  saveTeams(items: RescueTeam[], scenarioId?: RegionalScenarioId): void {
    const scId = scenarioId || this.getActiveScenarioId();
    this.set(`teams_${scId}`, items);
  }

  getShelters(scenarioId?: RegionalScenarioId): Shelter[] {
    const scId = scenarioId || this.getActiveScenarioId();
    const defaultData = (REGIONAL_SCENARIOS[scId] || REGIONAL_SCENARIOS.mumbai).shelters;
    return this.get<Shelter[]>(`shelters_${scId}`, defaultData);
  }

  saveShelters(items: Shelter[], scenarioId?: RegionalScenarioId): void {
    const scId = scenarioId || this.getActiveScenarioId();
    this.set(`shelters_${scId}`, items);
  }

  getResources(scenarioId?: RegionalScenarioId): ResourceItem[] {
    const scId = scenarioId || this.getActiveScenarioId();
    const defaultData = (REGIONAL_SCENARIOS[scId] || REGIONAL_SCENARIOS.mumbai).resources;
    return this.get<ResourceItem[]>(`resources_${scId}`, defaultData);
  }

  saveResources(items: ResourceItem[], scenarioId?: RegionalScenarioId): void {
    const scId = scenarioId || this.getActiveScenarioId();
    this.set(`resources_${scId}`, items);
  }

  getAlerts(scenarioId?: RegionalScenarioId): EmergencyAlert[] {
    const scId = scenarioId || this.getActiveScenarioId();
    const defaultAlert = (REGIONAL_SCENARIOS[scId] || REGIONAL_SCENARIOS.mumbai).activeAlert;
    return this.get<EmergencyAlert[]>(`alerts_${scId}`, [defaultAlert]);
  }

  saveAlerts(items: EmergencyAlert[], scenarioId?: RegionalScenarioId): void {
    const scId = scenarioId || this.getActiveScenarioId();
    this.set(`alerts_${scId}`, items);
  }

  // Pending offline SOS submission queue
  getPendingSOSQueue(): SOSRequest[] {
    return this.get<SOSRequest[]>('pending_sos_queue', []);
  }

  savePendingSOSQueue(items: SOSRequest[]): void {
    this.set('pending_sos_queue', items);
  }
}

const mockStore = new MockStorageService();

export const apiService = {
  // SCENARIO MANAGEMENT
  getActiveScenario(): RegionalScenario {
    return mockStore.getScenario();
  },

  setActiveScenario(id: RegionalScenarioId): RegionalScenario {
    mockStore.setActiveScenarioId(id);
    return mockStore.getScenario(id);
  },

  getAllScenarios(): RegionalScenario[] {
    return Object.values(REGIONAL_SCENARIOS);
  },

  // INCIDENTS
  async getIncidents(filters?: {
    category?: string;
    severity?: string;
    status?: string;
    district?: string;
  }): Promise<Incident[]> {
    if (API_BASE) {
      try {
        const query = new URLSearchParams(filters as any).toString();
        const res = await fetch(`${API_BASE}/incidents?${query}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) return json.data;
        }
      } catch (e) {
        console.warn('API error, falling back to local scenario store:', e);
      }
    }

    let list = mockStore.getIncidents();
    if (filters?.category && filters.category !== 'All') {
      list = list.filter((i) => i.category === filters.category);
    }
    if (filters?.severity && filters.severity !== 'All') {
      list = list.filter((i) => i.severity === filters.severity);
    }
    if (filters?.status && filters.status !== 'All') {
      list = list.filter((i) => i.status === filters.status);
    }
    if (filters?.district && filters.district !== 'All') {
      list = list.filter((i) => i.district === filters.district);
    }
    return list;
  },

  async createIncident(
    incidentData: Partial<Incident>,
    userRole: UserRole,
    userName: string
  ): Promise<Incident> {
    const now = new Date().toISOString();
    const scenario = mockStore.getScenario();
    const newInc: Incident = {
      incidentId: `INC-${scenario.state.substring(0, 2).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
      title: incidentData.title || 'Untitled Disaster Incident',
      description: incidentData.description || '',
      category: incidentData.category || 'Waterlogging',
      severity: incidentData.severity || 'Medium',
      status: 'Reported',
      locationName: incidentData.locationName || 'Location Not Specified',
      district: incidentData.district || scenario.name.split(',')[0],
      state: incidentData.state || scenario.state,
      latitude: incidentData.latitude || scenario.center[0],
      longitude: incidentData.longitude || scenario.center[1],
      reporterName: userName,
      reporterContact: incidentData.reporterContact || '',
      peopleAffected: incidentData.peopleAffected || 0,
      mediaUrls: incidentData.mediaUrls || [],
      isDemo: true,
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

    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/incidents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': userRole,
            'x-user-name': userName,
          },
          body: JSON.stringify(newInc),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data) return json.data;
        }
      } catch (e) {
        console.warn('API error, creating in local mock store:', e);
      }
    }

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
      try {
        const res = await fetch(`${API_BASE}/incidents/${incidentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': userRole,
            'x-user-name': userName,
          },
          body: JSON.stringify(updates),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data) return json.data;
        }
      } catch (e) {
        console.warn('API update failed, updating local mock store:', e);
      }
    }

    const current = mockStore.getIncidents();
    const idx = current.findIndex((i) => i.incidentId === incidentId);
    if (idx === -1) throw new Error('Incident not found in active records');

    const now = new Date().toISOString();
    const actionLabel = updates.status
      ? `Status changed to ${updates.status}`
      : updates.severity
      ? `Severity updated to ${updates.severity}`
      : updates.assignedTeamName
      ? `Assigned to ${updates.assignedTeamName}`
      : 'Incident details updated';

    const updated: Incident = {
      ...current[idx],
      ...updates,
      updatedAt: now,
      timeline: [
        ...(current[idx].timeline || []),
        {
          timestamp: now,
          action: actionLabel,
          actor: `${userName} (${userRole})`,
          notes: (updates as any).notes || 'Operational update logged.',
        },
      ],
    };

    current[idx] = updated;
    mockStore.saveIncidents(current);
    return updated;
  },

  // SOS DISTRESS BEACONS
  async getSOSRequests(): Promise<SOSRequest[]> {
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/sos`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) return json.data;
        }
      } catch (e) {
        console.warn('API error fetching SOS, fallback to mock store:', e);
      }
    }
    return mockStore.getSOS();
  },

  async submitSOS(
    sosData: Partial<SOSRequest>,
    userName: string
  ): Promise<{ request: SOSRequest; queuedOffline: boolean }> {
    const now = new Date().toISOString();
    const scenario = mockStore.getScenario();
    const newSOS: SOSRequest = {
      sosId: `SOS-${scenario.state.substring(0, 2).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
      requesterName: userName || 'Citizen',
      requesterPhone: sosData.requesterPhone || '',
      emergencyType: sosData.emergencyType || 'Life-threatening flood / disaster distress',
      urgency: sosData.urgency || 'Critical',
      status: 'Submitted',
      latitude: sosData.latitude || scenario.center[0],
      longitude: sosData.longitude || scenario.center[1],
      locationDescription: sosData.locationDescription || 'Urgent rescue location',
      district: sosData.district || scenario.name.split(',')[0],
      state: sosData.state || scenario.state,
      peopleCount: sosData.peopleCount || 1,
      specialNeeds: sosData.specialNeeds || [],
      notes: sosData.notes || '',
      isDemo: true,
      createdAt: now,
      updatedAt: now,
    };

    let queuedOffline = false;

    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/sos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSOS),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data) return { request: json.data, queuedOffline: false };
        } else {
          queuedOffline = true;
        }
      } catch (e) {
        console.warn('Network offline or backend down. Queuing SOS locally:', e);
        queuedOffline = true;
      }
    }

    if (queuedOffline) {
      const q = mockStore.getPendingSOSQueue();
      mockStore.savePendingSOSQueue([newSOS, ...q]);
    }

    const current = mockStore.getSOS();
    mockStore.saveSOS([newSOS, ...current]);
    return { request: newSOS, queuedOffline };
  },

  async updateSOSStatus(
    sosId: string,
    status: SOSRequest['status'],
    assignedTeamName?: string,
    notes?: string
  ): Promise<SOSRequest> {
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/sos/${sosId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'x-user-role': 'AUTHORITY' },
          body: JSON.stringify({ status, assignedTeamName, notes }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data) return json.data;
        }
      } catch (e) {
        console.warn('API error, updating SOS locally:', e);
      }
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
      try {
        const res = await fetch(`${API_BASE}/rescue/teams`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) return json.data;
        }
      } catch (e) {
        console.warn('API error fetching teams, fallback to mock store:', e);
      }
    }
    return mockStore.getTeams();
  },

  async updateTeamStatus(teamId: string, status: RescueTeam['currentStatus']): Promise<RescueTeam> {
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/rescue/teams/${teamId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'x-user-role': 'RESCUE_TEAM' },
          body: JSON.stringify({ currentStatus: status }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data) return json.data;
        }
      } catch (e) {
        console.warn('API error updating team status, fallback to local store:', e);
      }
    }

    const current = mockStore.getTeams();
    const idx = current.findIndex((t) => t.teamId === teamId);
    if (idx === -1) throw new Error('Rescue team not found');

    current[idx].currentStatus = status;
    current[idx].lastUpdated = new Date().toISOString();
    mockStore.saveTeams(current);
    return current[idx];
  },

  // SHELTERS
  async getShelters(): Promise<Shelter[]> {
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/shelters`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) return json.data;
        }
      } catch (e) {
        console.warn('API error fetching shelters, fallback to mock store:', e);
      }
    }
    return mockStore.getShelters();
  },

  async updateShelterOccupancy(shelterId: string, newOccupancy: number): Promise<Shelter> {
    const current = mockStore.getShelters();
    const idx = current.findIndex((s) => s.shelterId === shelterId);
    if (idx === -1) throw new Error('Shelter not found');

    if (newOccupancy < 0) {
      throw new Error('Occupancy cannot be negative');
    }
    if (newOccupancy > current[idx].capacity * 1.5) {
      throw new Error(`Occupancy exceeds critical capacity limit (${current[idx].capacity})`);
    }

    current[idx].currentOccupancy = newOccupancy;
    current[idx].status = newOccupancy >= current[idx].capacity ? 'Full' : 'Open';
    current[idx].updatedAt = new Date().toISOString();
    mockStore.saveShelters(current);
    return current[idx];
  },

  // RELIEF SUPPLIES INVENTORY
  async getResources(): Promise<ResourceItem[]> {
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/resources`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) return json.data;
        }
      } catch (e) {
        console.warn('API error fetching resources, fallback to mock store:', e);
      }
    }
    return mockStore.getResources();
  },

  async adjustResourceStock(
    resourceId: string,
    delta: number,
    action: 'dispatch' | 'restock'
  ): Promise<ResourceItem> {
    const current = mockStore.getResources();
    const idx = current.findIndex((r) => r.resourceId === resourceId);
    if (idx === -1) throw new Error('Relief supply item not found');

    const item = current[idx];
    let newQty = item.quantity;

    if (action === 'dispatch') {
      if (delta > item.quantity) {
        throw new Error(`Cannot dispatch ${delta} ${item.unit}. Available stock is only ${item.quantity} ${item.unit}.`);
      }
      newQty -= delta;
      item.lastDispatched = new Date().toISOString();
    } else {
      newQty += delta;
    }

    item.quantity = newQty;
    if (newQty === 0) {
      item.status = 'Depleted';
    } else if (newQty <= item.reorderThreshold) {
      item.status = 'Low Stock';
    } else {
      item.status = 'Available';
    }
    item.updatedAt = new Date().toISOString();

    current[idx] = item;
    mockStore.saveResources(current);
    return item;
  },

  // EMERGENCY BROADCAST ALERTS
  async getAlerts(): Promise<EmergencyAlert[]> {
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/alerts`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) return json.data;
        }
      } catch (e) {
        console.warn('API error fetching alerts, fallback to mock store:', e);
      }
    }
    return mockStore.getAlerts();
  },

  async broadcastAlert(
    alertData: Partial<EmergencyAlert>,
    userName: string
  ): Promise<EmergencyAlert> {
    const now = new Date().toISOString();
    const newAlert: EmergencyAlert = {
      alertId: `ALERT-IN-${Date.now().toString(36).toUpperCase()}`,
      title: alertData.title || 'Emergency Advisory Broadcast',
      severity: alertData.severity || 'High',
      disasterType: alertData.disasterType || 'Waterlogging',
      affectedRegions: alertData.affectedRegions || ['All Sub-Districts'],
      instructions: alertData.instructions || 'Follow official instructions from local disaster authorities.',
      issuedBy: `${userName} (Disaster Control HQ)`,
      sourceType: alertData.sourceType || 'Control Room Operator',
      issuedAt: now,
      updatedAt: now,
      active: true,
      isDemo: true,
      recommendedActions: alertData.recommendedActions || [
        'Tune into local radio/TV announcements.',
        'Keep emergency supplies in a dry bag.',
      ],
      snsMessageId: `mock-sns-${Date.now()}`,
    };

    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/alerts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': 'AUTHORITY',
            'x-user-name': userName,
          },
          body: JSON.stringify(newAlert),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data) return json.data;
        }
      } catch (e) {
        console.warn('API error publishing alert, saving to mock store:', e);
      }
    }

    const current = mockStore.getAlerts();
    mockStore.saveAlerts([newAlert, ...current]);
    return newAlert;
  },

  // S3 PRESIGNED UPLOAD
  async getPresignedUploadUrl(fileName: string, contentType: string, fileSize: number) {
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/uploads/presign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName, contentType, fileSize }),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('API presign error, falling back to simulated file upload:', e);
      }
    }

    return {
      uploadUrl: 'https://mock-s3-upload.local',
      fileUrl: URL.createObjectURL(new Blob(['mock-image-data'], { type: contentType })),
      objectKey: `incidents/${Date.now()}-${fileName}`,
    };
  },

  // DASHBOARD DYNAMIC STATS (Zero hardcoded numbers - calculated dynamically)
  async getDashboardStats(): Promise<DashboardStats> {
    const incidents = mockStore.getIncidents();
    const sos = mockStore.getSOS();
    const teams = mockStore.getTeams();
    const shelters = mockStore.getShelters();
    const resources = mockStore.getResources();

    const activeIncidents = incidents.filter(
      (i) => i.status !== 'Resolved' && i.status !== 'Closed' && i.status !== 'Rejected'
    ).length;

    const criticalIncidents = incidents.filter(
      (i) => i.severity === 'Critical' && i.status !== 'Resolved' && i.status !== 'Closed'
    ).length;

    const openSOSRequests = sos.filter(
      (s) => s.status !== 'Resolved' && s.status !== 'Cancelled'
    ).length;

    const incidentsAwaitingReview = incidents.filter(
      (i) => i.status === 'Reported' || i.status === 'Under Verification'
    ).length;

    const peopleAffectedFromIncidents = incidents.reduce(
      (sum, i) => sum + (i.peopleAffected || 0),
      0
    );
    const peopleAffectedFromSOS = sos.reduce(
      (sum, s) => sum + (s.peopleCount || 0),
      0
    );
    const peopleAffectedCount = peopleAffectedFromIncidents + peopleAffectedFromSOS;

    const teamsDispatched = teams.filter(
      (t) => t.currentStatus === 'Dispatched' || t.currentStatus === 'On Scene'
    ).length;

    const resolvedIncidents = incidents.filter(
      (i) => i.status === 'Resolved' || i.status === 'Closed'
    ).length;

    const shelterCapacityTotal = shelters.reduce((acc, s) => acc + (s.capacity || 0), 0);
    const shelterOccupancyTotal = shelters.reduce((acc, s) => acc + (s.currentOccupancy || 0), 0);
    const shelterAvailableSlots = Math.max(0, shelterCapacityTotal - shelterOccupancyTotal);

    const lowStockItemsCount = resources.filter(
      (r) => r.status === 'Low Stock' || r.status === 'Depleted'
    ).length;

    return {
      totalIncidents: incidents.length,
      activeIncidents,
      criticalIncidents,
      openSOSRequests,
      incidentsAwaitingReview,
      peopleAffectedCount,
      teamsDispatched,
      totalTeams: teams.length,
      resolvedIncidents,
      shelterCapacityTotal,
      shelterOccupancyTotal,
      shelterAvailableSlots,
      lowStockItemsCount,
    };
  },
};
