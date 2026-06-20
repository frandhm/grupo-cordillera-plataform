/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Goal, KPI, Measurement } from '../../types.js';
import dbInstance from '../db.js';
import { KpiService } from './kpiService.js';

// --- STRUCTURAL ENCAPSULATION PATTERN: KPI SERVICE ADAPTER ---
// Adapts the KPI microservice's features to allow safe communication and validation.
export class KpiServiceAdapter {
  private kpiService = new KpiService();

  /**
   * Safe check to identify if a KPI exists. Enforces boundaries between microservices.
   */
  public verifyKpiExists(kpiId: string): boolean {
    const kpi = this.kpiService.getKpiDetails(kpiId);
    return kpi !== null;
  }

  /**
   * Retrieves full KPI details.
   */
  public getKpi(kpiId: string): KPI | null {
    return this.kpiService.getKpiDetails(kpiId);
  }

  /**
   * Retrieves measurements for a target KPI.
   */
  public getMeasurements(kpiId: string): Measurement[] {
    try {
      return this.kpiService.getMeasurements(kpiId);
    } catch {
      return [];
    }
  }
}

// --- MODEL & VALIDATOR ---
export class GoalModel implements Goal {
  public id: string;
  public kpiId: string;
  public targetValue: number;
  public operator: 'GREATER_EQUAL' | 'LESS_EQUAL' | 'EQUAL';
  public periodName: string;
  public periodStart: string; // YYYY-MM-DD
  public periodEnd: string; // YYYY-MM-DD
  public description: string;
  public createdAt: string;

  constructor(data: Goal) {
    this.id = data.id;
    this.kpiId = data.kpiId;
    this.targetValue = data.targetValue;
    this.operator = data.operator;
    this.periodName = data.periodName;
    this.periodStart = data.periodStart;
    this.periodEnd = data.periodEnd;
    this.description = data.description;
    this.createdAt = data.createdAt;
  }

  public static validate(data: Partial<Goal>): string | null {
    if (!data.kpiId || data.kpiId.trim().length === 0) {
      return 'La asociación a un indicador (KPI) es obligatoria.';
    }
    if (data.targetValue === undefined || isNaN(data.targetValue)) {
      return 'El valor objetivo (Target) es obligatorio y debe ser un número.';
    }
    if (!data.operator) {
      return 'El operador de cumplimiento de la meta es obligatorio.';
    }
    if (!data.periodName || data.periodName.trim().length === 0) {
      return 'El nombre del periodo es obligatorio (ej: Q1 2026).';
    }
    if (!data.periodStart || !data.periodStart.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return 'La fecha de inicio de evaluación tiene un formato inválido (debe ser YYYY-MM-DD).';
    }
    if (!data.periodEnd || !data.periodEnd.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return 'La fecha de fin de evaluación tiene un formato inválido (debe ser YYYY-MM-DD).';
    }
    if (new Date(data.periodStart).getTime() > new Date(data.periodEnd).getTime()) {
      return 'La fecha de inicio no puede ser posterior a la fecha de término.';
    }
    return null;
  }
}

// --- REPOSITORY ---
export class GoalRepository {
  public getAll(): Goal[] {
    return dbInstance.goals;
  }

  public getById(id: string): Goal | null {
    const item = dbInstance.goals.find(g => g.id === id);
    return item ? { ...item } : null;
  }

  public getByKpiId(kpiId: string): Goal[] {
    return dbInstance.goals.filter(g => g.kpiId === kpiId);
  }

  public save(goal: Goal): Goal {
    const list = dbInstance.goals;
    const index = list.findIndex(g => g.id === goal.id);
    if (index >= 0) {
      list[index] = goal;
    } else {
      list.push(goal);
    }
    dbInstance.goals = list;
    return goal;
  }
}

// --- SERVICE ---
export class GoalService {
  private repo = new GoalRepository();
  private kpiAdapter = new KpiServiceAdapter();

  public listGoals(): Goal[] {
    return this.repo.getAll();
  }

  public getGoal(id: string): Goal | null {
    return this.repo.getById(id);
  }

  public createGoal(data: Omit<Goal, 'id' | 'createdAt'>): Goal {
    // 1. Integration validation using pattern: check if KPI exists
    const kpiExists = this.kpiAdapter.verifyKpiExists(data.kpiId);
    if (!kpiExists) {
      throw new Error(`Error de Integración: El indicador (KPI) asociado con ID '${data.kpiId}' no existe.`);
    }

    // 2. Validate format values
    const error = GoalModel.validate(data);
    if (error) {
      throw new Error(error);
    }

    const newGoal: Goal = {
      ...data,
      id: `goal-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    };

    return this.repo.save(newGoal);
  }

  public updateGoal(id: string, data: Partial<Goal>): Goal {
    const existingGoal = this.repo.getById(id);
    if (!existingGoal) {
      throw new Error(`Meta con ID ${id} no encontrada.`);
    }

    if (data.kpiId && data.kpiId !== existingGoal.kpiId) {
      const kpiExists = this.kpiAdapter.verifyKpiExists(data.kpiId);
      if (!kpiExists) {
        throw new Error(`Error de Integración: El KPI '${data.kpiId}' asociado no existe.`);
      }
    }

    const updated = {
      ...existingGoal,
      ...data,
      id // preserve id
    };

    const error = GoalModel.validate(updated);
    if (error) {
      throw new Error(error);
    }

    return this.repo.save(updated);
  }

  /**
   * Evaluates the current compliance state of a Goal.
   * Compares the target value to average KPI measurements within the target period.
   */
  public evaluateCompliance(goalId: string): {
    goal: Goal;
    kpi: KPI | null;
    averageValue: number | null;
    measurementsCount: number;
    complianceRate: number; // 0 to 100 (or higher)
    status: 'EXCELLENT' | 'WARNING' | 'CRITICAL' | 'NO_DATA';
  } {
    const goal = this.repo.getById(goalId);
    if (!goal) {
      throw new Error(`Meta con ID ${goalId} no existe.`);
    }

    const kpi = this.kpiAdapter.getKpi(goal.kpiId);
    const measurements = this.kpiAdapter.getMeasurements(goal.kpiId);

    // Filter measurements within the evaluation period
    const start = new Date(goal.periodStart).getTime();
    const end = new Date(goal.periodEnd).getTime();

    const periodMeasurements = measurements.filter(m => {
      const mTime = new Date(m.date).getTime();
      return mTime >= start && mTime <= end;
    });

    if (periodMeasurements.length === 0) {
      return {
        goal,
        kpi,
        averageValue: null,
        measurementsCount: 0,
        complianceRate: 0,
        status: 'NO_DATA'
      };
    }

    // Calculate average value in this period
    const sum = periodMeasurements.reduce((acc, curr) => acc + curr.value, 0);
    const avg = sum / periodMeasurements.length;

    let complianceRate = 0;
    let status: 'EXCELLENT' | 'WARNING' | 'CRITICAL' = 'CRITICAL';

    if (goal.operator === 'GREATER_EQUAL') {
      complianceRate = Math.round((avg / goal.targetValue) * 100);
      if (avg >= goal.targetValue) {
        status = 'EXCELLENT';
      } else if (avg >= goal.targetValue * 0.8) {
        status = 'WARNING';
      } else {
        status = 'CRITICAL';
      }
    } else if (goal.operator === 'LESS_EQUAL') {
      // For items where LESS is better (e.g. Accidents or incident resolution times)
      complianceRate = avg === 0
        ? 100
        : Math.max(0, Math.round(((goal.targetValue) / avg) * 100));

      if (avg <= goal.targetValue) {
        status = 'EXCELLENT';
      } else if (avg <= goal.targetValue * 1.25) {
        // Tolerable warning
        status = 'WARNING';
      } else {
        status = 'CRITICAL';
      }
    } else {
      // EQUAL
      complianceRate = avg === goal.targetValue ? 100 : 0;
      status = avg === goal.targetValue ? 'EXCELLENT' : 'CRITICAL';
    }

    return {
      goal,
      kpi,
      averageValue: Number(avg.toFixed(2)),
      measurementsCount: periodMeasurements.length,
      complianceRate: Math.max(0, complianceRate), // avoid negatives
      status
    };
  }
}

// --- CONTROLLER ---
export class GoalController {
  private service = new GoalService();

  public getGoals = (req: any, res: any) => {
    try {
      const { kpiId } = req.query;
      if (kpiId) {
        const repo = new GoalRepository();
        return res.json(repo.getByKpiId(kpiId));
      }
      return res.json(this.service.listGoals());
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  public getGoalById = (req: any, res: any) => {
    try {
      const { id } = req.params;
      const goal = this.service.getGoal(id);
      if (!goal) {
        return res.status(404).json({ error: `Meta con ID ${id} no encontrada.` });
      }
      return res.json(goal);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  public createGoalRoute = (req: any, res: any) => {
    try {
      const goal = this.service.createGoal(req.body);
      return res.status(201).json(goal);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };

  public updateGoalRoute = (req: any, res: any) => {
    try {
      const { id } = req.params;
      const goal = this.service.updateGoal(id, req.body);
      return res.json(goal);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };

  public getComplianceRoute = (req: any, res: any) => {
    try {
      const { id } = req.params;
      const compliance = this.service.evaluateCompliance(id);
      return res.json(compliance);
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  };
}
