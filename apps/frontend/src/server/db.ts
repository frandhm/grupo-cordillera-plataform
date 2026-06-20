/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { KPI, Measurement, Goal, Area, Team, AuditLog } from '../types.js';

interface DatabaseSchema {
  kpis: KPI[];
  measurements: Measurement[];
  goals: Goal[];
  areas: Area[];
  teams: Team[];
  logs: AuditLog[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'assets', 'database_store.json');

// Ensure assets directory exists
const assetsDir = path.join(process.cwd(), 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Initial rich seed data for Grupo Cordillera
const initialData: DatabaseSchema = {
  areas: [
    {
      id: 'area-1',
      name: 'Operaciones Mineras',
      description: 'Supervisión de faenas de extracción de cobre y control de seguridad vial en yacimientos cordilleranos.',
      managerName: 'Ing. Carlos Mendoza',
      createdAt: '2026-01-10T08:00:00Z'
    },
    {
      id: 'area-2',
      name: 'Energías Renovables',
      description: 'Gestión y operación del Parque Eólico de la Alta Cordillera y subestaciones solares.',
      managerName: 'Dra. Sofía Valenzuela',
      createdAt: '2026-01-15T09:30:00Z'
    },
    {
      id: 'area-3',
      name: 'Tecnología e Innovación',
      description: 'Implementación del gemelo digital de faenas, conectividad IoT de maquinaria y ciberseguridad.',
      managerName: 'Andrés Silva',
      createdAt: '2026-02-01T10:00:00Z'
    }
  ],
  teams: [
    {
      id: 'team-1',
      name: 'Exploración y Sondaje',
      areaId: 'area-1',
      memberCount: 15,
      createdAt: '2026-01-12T08:00:00Z'
    },
    {
      id: 'team-2',
      name: 'Extracción de Minerales',
      areaId: 'area-1',
      memberCount: 45,
      createdAt: '2026-01-12T08:00:00Z'
    },
    {
      id: 'team-3',
      name: 'Operaciones Parque Eólico',
      areaId: 'area-2',
      memberCount: 12,
      createdAt: '2026-01-18T09:30:00Z'
    },
    {
      id: 'team-4',
      name: 'Mantenimiento Solar',
      areaId: 'area-2',
      memberCount: 18,
      createdAt: '2026-01-18T09:30:00Z'
    },
    {
      id: 'team-5',
      name: 'Desarrollo de Software IoT',
      areaId: 'area-3',
      memberCount: 24,
      createdAt: '2026-02-05T10:00:00Z'
    },
    {
      id: 'team-6',
      name: 'Ciberseguridad Industrial',
      areaId: 'area-3',
      memberCount: 8,
      createdAt: '2026-02-05T10:00:00Z'
    }
  ],
  kpis: [
    {
      id: 'kpi-1',
      name: 'Producción Diaria de Cobre',
      description: 'Toneladas de concentrado de cobre extraídas y procesadas en la unidad cordillerana norte.',
      unitOfMeasurement: 'Tons',
      areaId: 'area-1',
      createdAt: '2026-01-20T08:00:00Z'
    },
    {
      id: 'kpi-2',
      name: 'Índice de Frecuencia de Accidentes',
      description: 'Número de accidentes con tiempo perdido por millón de horas de trabajo acumuladas.',
      unitOfMeasurement: 'IF',
      areaId: 'area-1',
      createdAt: '2026-01-22T08:00:00Z'
    },
    {
      id: 'kpi-3',
      name: 'Generación de Energía Limpia',
      description: 'Generación agregada diaria de energía eólica y solar inyectada al sistema central.',
      unitOfMeasurement: 'MWh',
      areaId: 'area-2',
      createdAt: '2026-01-25T08:00:00Z'
    },
    {
      id: 'kpi-4',
      name: 'Disponibilidad de Canales Críticos',
      description: 'Porcentaje de uptime de los sistemas de telecomunicación satelital y domótica minera.',
      unitOfMeasurement: '%',
      areaId: 'area-3',
      createdAt: '2026-02-10T08:00:00Z'
    },
    {
      id: 'kpi-5',
      name: 'Tiempo de Resolución de Incidentes TI',
      description: 'Promedio mensual de horas necesarias para catalogar y resolver incidentes de seguridad crítica.',
      unitOfMeasurement: 'Horas',
      areaId: 'area-3',
      createdAt: '2026-02-12T08:00:00Z'
    }
  ],
  goals: [
    {
      id: 'goal-1',
      kpiId: 'kpi-1',
      targetValue: 120,
      operator: 'GREATER_EQUAL',
      periodName: 'Semestre 1 2026',
      periodStart: '2026-01-01',
      periodEnd: '2026-06-30',
      description: 'Mantener un promedio diario superior o igual a 120 toneladas de concentrado de cobre.',
      createdAt: '2026-01-21T00:00:00Z'
    },
    {
      id: 'goal-2',
      kpiId: 'kpi-2',
      targetValue: 1.5,
      operator: 'LESS_EQUAL',
      periodName: 'Semestre 1 2026',
      periodStart: '2026-01-01',
      periodEnd: '2026-06-30',
      description: 'Tasa de accidentabilidad menor o igual a 1.5 incidentes por millón de horas.',
      createdAt: '2026-01-23T00:00:00Z'
    },
    {
      id: 'goal-3',
      kpiId: 'kpi-3',
      targetValue: 450,
      operator: 'GREATER_EQUAL',
      periodName: 'Q2 2026',
      periodStart: '2026-04-01',
      periodEnd: '2026-06-30',
      description: 'Generar promedio de 450 MWh o más por día durante el segundo trimestre.',
      createdAt: '2026-01-26T00:00:00Z'
    },
    {
      id: 'goal-4',
      kpiId: 'kpi-4',
      targetValue: 99.9,
      operator: 'GREATER_EQUAL',
      periodName: 'Q2 2026',
      periodStart: '2026-04-01',
      periodEnd: '2026-06-30',
      description: 'Asegurar disponibilidad de infraestructura superior al 99.9%.',
      createdAt: '2026-02-11T00:00:00Z'
    }
  ],
  measurements: [
    // Measurements for KPI-1 (Copper prod - Target >= 120)
    { id: 'm-1', kpiId: 'kpi-1', value: 118, date: '2026-06-01', registeredAt: '2026-06-01T18:00:00Z', notes: 'Ligera baja por mantenimiento programado de correas.' },
    { id: 'm-2', kpiId: 'kpi-1', value: 122, date: '2026-06-03', registeredAt: '2026-06-03T18:00:00Z', notes: 'Excelente ritmo de excavación en zona central.' },
    { id: 'm-3', kpiId: 'kpi-1', value: 125, date: '2026-06-05', registeredAt: '2026-06-05T18:00:00Z', notes: 'Optimización de molienda incrementó el rendimiento.' },
    { id: 'm-4', kpiId: 'kpi-1', value: 115, date: '2026-06-07', registeredAt: '2026-06-07T18:00:00Z', notes: 'Afectado por condiciones de viento blanco en faena.' },
    { id: 'm-5', kpiId: 'kpi-1', value: 121, date: '2026-06-09', registeredAt: '2026-06-09T18:00:00Z', notes: 'Metas diarias recuperadas.' },

    // Measurements for KPI-2 (Accidents - Target <= 1.5)
    { id: 'm-6', kpiId: 'kpi-2', value: 1.2, date: '2026-05-15', registeredAt: '2026-05-15T15:00:00Z', notes: 'Taller de seguridad vial completado en terreno.' },
    { id: 'm-7', kpiId: 'kpi-2', value: 1.1, date: '2026-06-01', registeredAt: '2026-06-01T15:00:00Z', notes: 'Auditoría interna aprobada.' },
    { id: 'm-8', kpiId: 'kpi-2', value: 1.8, date: '2026-06-08', registeredAt: '2026-06-08T15:00:00Z', notes: 'Incidente menor registrado por resbalón en andamio.' },

    // Measurements for KPI-3 (Clean energy - Target >= 450)
    { id: 'm-9', kpiId: 'kpi-3', value: 430, date: '2026-06-02', registeredAt: '2026-06-02T20:00:00Z', notes: 'Día nublado, menor aporte solar fotovoltaico.' },
    { id: 'm-10', kpiId: 'kpi-3', value: 465, date: '2026-06-04', registeredAt: '2026-06-04T20:00:00Z', notes: 'Fuertes ráfagas de viento aumentaron inyección eólica.' },
    { id: 'm-11', kpiId: 'kpi-3', value: 452, date: '2026-06-07', registeredAt: '2026-06-07T20:00:00Z', notes: 'Condiciones óptimas mixtas.' },

    // Measurements for KPI-4 (Uptime - Target >= 99.9)
    { id: 'm-12', kpiId: 'kpi-4', value: 99.95, date: '2026-05-28', registeredAt: '2026-05-28T10:00:00Z', notes: 'Efectividad en los respaldos de fibra.' },
    { id: 'm-13', kpiId: 'kpi-4', value: 99.85, date: '2026-06-05', registeredAt: '2026-06-05T10:00:00Z', notes: 'Micro-corte por tormenta eléctrica continental.' },

    // Measurements for KPI-5 (TI hours - No active Goal but registered measurements)
    { id: 'm-14', kpiId: 'kpi-5', value: 1.8, date: '2026-05-20', registeredAt: '2026-05-20T12:00:00Z', notes: 'Casos normales resueltos expeditamente.' },
    { id: 'm-15', kpiId: 'kpi-5', value: 2.4, date: '2026-06-06', registeredAt: '2026-06-06T12:00:00Z', notes: 'Retraso por espera de aprobación de proveedor externo.' }
  ],
  logs: [
    {
      id: 'log-1',
      timestamp: '2026-06-09T18:30:00Z',
      user: 'Carlos Mendoza',
      role: 'ADMIN',
      action: 'Inicialización de Sistema',
      details: 'El sistema de gobernanza y sincronización de microservicios BFF de Grupo Cordillera se inició correctamente.'
    },
    {
      id: 'log-2',
      timestamp: '2026-06-09T19:45:00Z',
      user: 'Carlos Mendoza',
      role: 'ADMIN',
      action: 'Asociación de Meta',
      details: 'Se definió la meta "Semestre 1 2026" para el KPI Producción Diaria de Cobre (kpi-1) con valor objetivo >= 120 Tons.'
    },
    {
      id: 'log-3',
      timestamp: '2026-06-09T20:10:00Z',
      user: 'Diana Cruz',
      role: 'GERENTE',
      action: 'Creación de Indicador',
      details: 'Se registró un nuevo indicador operativo en el rubro de Energías Renovables: "Generación de Energía Limpia".'
    }
  ]
};

export class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed.logs) {
          parsed.logs = [];
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error reading file database, backing up and reset to initial:', e);
    }
    // Write seeds if database doesn't exist
    this.saveData(initialData);
    return JSON.parse(JSON.stringify(initialData));
  }

  private saveData(data: DatabaseSchema): void {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist database state:', e);
    }
  }

  public persist(): void {
    this.saveData(this.data);
  }

  // Getters
  public get kpis(): KPI[] { return this.data.kpis; }
  public get measurements(): Measurement[] { return this.data.measurements; }
  public get goals(): Goal[] { return this.data.goals; }
  public get areas(): Area[] { return this.data.areas; }
  public get teams(): Team[] { return this.data.teams; }
  public get logs(): AuditLog[] { return this.data.logs || []; }

  // Setters/mutations
  public set kpis(val: KPI[]) { this.data.kpis = val; this.persist(); }
  public set measurements(val: Measurement[]) { this.data.measurements = val; this.persist(); }
  public set goals(val: Goal[]) { this.data.goals = val; this.persist(); }
  public set areas(val: Area[]) { this.data.areas = val; this.persist(); }
  public set teams(val: Team[]) { this.data.teams = val; this.persist(); }
  public set logs(val: AuditLog[]) { this.data.logs = val; this.persist(); }

  public addLog(user: string, role: 'ADMIN' | 'GERENTE' | 'VENDEDOR', action: string, details: string): void {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      user,
      role,
      action,
      details
    };
    if (!this.data.logs) {
      this.data.logs = [];
    }
    this.data.logs.unshift(newLog);
    this.persist();
  }
}

export const dbInstance = new Database();
export default dbInstance;
