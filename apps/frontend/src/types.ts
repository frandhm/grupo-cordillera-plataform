/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface KPI {
  id: string;
  name: string;
  description: string;
  unitOfMeasurement: string; // e.g., "%", "USD", "Hours", "Units"
  areaId: string; // associated area
  createdAt: string;
}

export interface Measurement {
  id: string;
  kpiId: string;
  value: number;
  date: string; // YYYY-MM-DD
  registeredAt: string;
  notes?: string;
}

export interface Goal {
  id: string;
  kpiId: string;
  targetValue: number;
  operator: 'GREATER_EQUAL' | 'LESS_EQUAL' | 'EQUAL'; // threshold rule
  periodName: string; // e.g., "Q1 2026", "Junio 2026"
  periodStart: string; // YYYY-MM-DD
  periodEnd: string; // YYYY-MM-DD
  description: string;
  createdAt: string;
}

export interface Area {
  id: string;
  name: string;
  description: string;
  managerName?: string;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  areaId: string; // associated Area
  memberCount: number;
  createdAt: string;
}

// BFF Combined Views
export interface KpiDetailedInfo {
  kpi: KPI;
  area?: Area;
  latestGoal?: Goal;
  measurements: Measurement[];
  complianceRate?: number; // Calculated compliance (0-100)
  status?: 'EXCELLENT' | 'WARNING' | 'CRITICAL' | 'NO_DATA';
}

export interface AreaPerformanceSummary {
  area: Area;
  teams: Team[];
  kpisCount: number;
  activeGoalsCount: number;
  averageCompliance: number; // 0-100
  kpiDetails: KpiDetailedInfo[];
}

export interface DashboardOverview {
  totalKpis: number;
  totalGoals: number;
  totalAreas: number;
  totalTeams: number;
  averageGlobalCompliance: number; // 0-100
  kpisByStatus: {
    excellent: number;
    warning: number;
    critical: number;
    noData: number;
  };
  recentMeasurements: {
    measurement: Measurement;
    kpiName: string;
    unit: string;
  }[];
}

export type UserRole = 'ADMIN' | 'GERENTE' | 'VENDEDOR';

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  details: string;
}


