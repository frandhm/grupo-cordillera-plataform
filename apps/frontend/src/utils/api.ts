/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { KPI, Measurement, Goal, Area, Team, KpiDetailedInfo, AreaPerformanceSummary, DashboardOverview, AuditLog } from '../types.js';

const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  
  // Dynamically set user headers from standard storage session
  const authHeaders: Record<string, string> = {};
  try {
    const sessionRaw = localStorage.getItem('grupocordillera_session');
    if (sessionRaw) {
      const session = JSON.parse(sessionRaw);
      if (session && session.name && session.role) {
        authHeaders['x-user-name'] = session.name;
        authHeaders['x-user-role'] = session.role;
      }
    }
  } catch (e) {
    console.error('Failed to parse session storage:', e);
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(options?.headers || {}),
    }
  });

  if (!response.ok) {
    let errMsg = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const data = await response.json();
      if (data && data.error) errMsg = data.error;
    } catch {}
    throw new Error(errMsg);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // KPIs
  getKpis: () => request<KPI[]>('/kpis'),
  getKpiById: (id: string) => request<KPI>(`/kpis/${id}`),
  createKpi: (data: Omit<KPI, 'id' | 'createdAt'>) => request<KPI>('/kpis', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateKpi: (id: string, data: Partial<KPI>) => request<KPI>(`/kpis/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  getKpiMeasurements: (id: string) => request<Measurement[]>(`/kpis/${id}/measurements`),
  addKpiMeasurement: (id: string, data: { value: number; date: string; notes?: string }) => request<Measurement>(`/kpis/${id}/measurements`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Goals
  getGoals: (kpiId?: string) => request<Goal[]>(`/goals${kpiId ? `?kpiId=${kpiId}` : ''}`),
  getGoalById: (id: string) => request<Goal>(`/goals/${id}`),
  createGoal: (data: Omit<Goal, 'id' | 'createdAt'>) => request<Goal>('/goals', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getGoalCompliance: (id: string) => request<{
    goal: Goal;
    kpi: KPI | null;
    averageValue: number | null;
    measurementsCount: number;
    complianceRate: number;
    status: KpiDetailedInfo['status'];
  }>(`/goals/${id}/compliance`),

  // Areas & Teams
  getAreas: () => request<Area[]>('/areas'),
  getAreaById: (id: string) => request<Area>(`/areas/${id}`),
  createArea: (data: { name: string; description: string; managerName?: string }) => request<Area>('/areas', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getTeams: (areaId?: string) => request<Team[]>(`/areas/teams${areaId ? `?areaId=${areaId}` : ''}`),
  createTeam: (data: { name: string; areaId: string; memberCount: number }) => request<Team>('/areas/teams', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getAreaIndicators: (id: string) => request<KPI[]>(`/areas/${id}/indicators`),

  // BFF Unified Aggregates (Orchestrators)
  getBffDashboard: () => request<DashboardOverview>('/bff/dashboard'),
  getBffKpisDetailed: () => request<KpiDetailedInfo[]>('/bff/kpis-detailed'),
  getBffAreasPerformance: () => request<AreaPerformanceSummary[]>('/bff/areas-performance'),

  // Authentication & Auditing (Logs)
  login: (credentials: { email: string; password?: string }) => request<{ success: boolean; user: { name: string; email: string; role: any; initials: string } }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  getLogs: () => request<AuditLog[]>('/logs')
};
