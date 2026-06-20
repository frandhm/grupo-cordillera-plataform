/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { GoalModel, GoalService } from './goalService.js';
import dbInstance from '../db.js';
import { Goal, KPI, Measurement } from '../../types.js';

describe('Goal/Meta Management and Compliance Business Logic', () => {
  let originalKpis: KPI[];
  let originalGoals: Goal[];
  let originalMeasurements: Measurement[];

  beforeAll(() => {
    // Backup dbInstance memory to prevent test pollution
    originalKpis = [...dbInstance.kpis];
    originalGoals = [...dbInstance.goals];
    originalMeasurements = [...dbInstance.measurements];
  });

  afterAll(() => {
    // Restore dbInstance memory
    dbInstance.kpis = originalKpis;
    dbInstance.goals = originalGoals;
    dbInstance.measurements = originalMeasurements;
  });

  beforeEach(() => {
    // Reset database to a clean, predictable state for each test
    dbInstance.kpis = [
      {
        id: 'test-kpi-1',
        name: 'Producción de Cobre',
        description: 'Concentrado de mineral',
        unitOfMeasurement: 'ton',
        areaId: 'area-1',
        createdAt: '2026-01-01T00:00:00Z'
      },
      {
        id: 'test-kpi-2',
        name: 'Accidentes de Trabajo',
        description: 'Tasa de accidentabilidad',
        unitOfMeasurement: 'casos',
        areaId: 'area-1',
        createdAt: '2026-01-01T00:00:00Z'
      }
    ];

    dbInstance.goals = [
      {
        id: 'test-goal-1',
        kpiId: 'test-kpi-1',
        targetValue: 100,
        operator: 'GREATER_EQUAL',
        periodName: 'Q1 2026',
        periodStart: '2026-01-01',
        periodEnd: '2026-02-28',
        description: 'Extraer al menos 100 toneladas diarias promedio',
        createdAt: '2026-01-02T00:00:00Z'
      },
      {
        id: 'test-goal-2',
        kpiId: 'test-kpi-2',
        targetValue: 2,
        operator: 'LESS_EQUAL',
        periodName: 'Q1 2026',
        periodStart: '2026-01-01',
        periodEnd: '2026-02-28',
        description: 'Mantener tasa de accidentabilidad bajo 2 casos',
        createdAt: '2026-01-02T00:00:00Z'
      }
    ];

    dbInstance.measurements = [];
  });

  describe('GoalModel.validate (Static Validator)', () => {
    it('should pass validation with valid goal attributes', () => {
      const valid: Partial<Goal> = {
        kpiId: 'test-kpi-1',
        targetValue: 150,
        operator: 'GREATER_EQUAL',
        periodName: 'Q2 2026',
        periodStart: '2026-04-01',
        periodEnd: '2026-06-30'
      };
      expect(GoalModel.validate(valid)).toBeNull();
    });

    it('should reject goals with missing or empty associate KPI', () => {
      const invalid: Partial<Goal> = {
        kpiId: '   ',
        targetValue: 100,
        operator: 'GREATER_EQUAL',
        periodName: 'Q1 2026',
        periodStart: '2026-01-01',
        periodEnd: '2026-02-28'
      };
      expect(GoalModel.validate(invalid)).toContain('indicador');
    });

    it('should reject invalid date formats', () => {
      const invalid: Partial<Goal> = {
        kpiId: 'test-kpi-1',
        targetValue: 100,
        operator: 'GREATER_EQUAL',
        periodName: 'Q1 2026',
        periodStart: '01/01/2026', // Incorrect format
        periodEnd: '2026-02-28'
      };
      expect(GoalModel.validate(invalid)).toContain('formato inválido');
    });

    it('should reject start date greater than end date', () => {
      const invalid: Partial<Goal> = {
        kpiId: 'test-kpi-1',
        targetValue: 100,
        operator: 'GREATER_EQUAL',
        periodName: 'Q1 2026',
        periodStart: '2026-02-28',
        periodEnd: '2026-01-01' // Terminus is earlier
      };
      expect(GoalModel.validate(invalid)).toContain('fecha de inicio no puede ser posterior');
    });
  });

  describe('GoalService & compliance evaluations', () => {
    const goalService = new GoalService();

    it('should create new goals safely when KPI exists', () => {
      const created = goalService.createGoal({
        kpiId: 'test-kpi-1',
        targetValue: 200,
        operator: 'GREATER_EQUAL',
        periodName: 'Q3 2026',
        periodStart: '2026-07-01',
        periodEnd: '2026-09-30',
        description: 'New production target'
      });
      expect(created.id).toBeDefined();
      expect(created.targetValue).toBe(200);
      expect(dbInstance.goals.find(g => g.id === created.id)).toBeDefined();
    });

    it('should throw an integration error if the associated KPI does not exist', () => {
      expect(() => {
        goalService.createGoal({
          kpiId: 'kpi-not-found',
          targetValue: 50,
          operator: 'GREATER_EQUAL',
          periodName: 'Test Period',
          periodStart: '2026-01-01',
          periodEnd: '2026-02-01',
          description: 'No KPI matched'
        });
      }).toThrow('no existe');
    });

    it('should return NO_DATA status if no measurements exist in target period', () => {
      const evaluation = goalService.evaluateCompliance('test-goal-1');
      expect(evaluation.status).toBe('NO_DATA');
      expect(evaluation.averageValue).toBeNull();
      expect(evaluation.complianceRate).toBe(0);
    });

    it('should correctly evaluate GREATER_EQUAL operator', () => {
      // Setup measurements in period ('2026-01-01' to '2026-02-28')
      // Target value is 100
      dbInstance.measurements = [
        { id: 'm1', kpiId: 'test-kpi-1', value: 110, date: '2026-01-10', registeredAt: '2026-01-10T00:00:00Z' },
        { id: 'm2', kpiId: 'test-kpi-1', value: 90, date: '2026-01-20', registeredAt: '2026-01-20T00:00:00Z' }
      ]; // average = 100. Meets 100 target

      let evaluation = goalService.evaluateCompliance('test-goal-1');
      expect(evaluation.averageValue).toBe(100);
      expect(evaluation.status).toBe('EXCELLENT');
      expect(evaluation.complianceRate).toBe(100);

      // Warning baseline (between 80% and 100% of target) -> Target 100 * 0.8 = 80
      dbInstance.measurements = [
        { id: 'm3', kpiId: 'test-kpi-1', value: 85, date: '2026-01-15', registeredAt: '2026-01-15T00:00:00Z' }
      ]; // average = 85
      evaluation = goalService.evaluateCompliance('test-goal-1');
      expect(evaluation.status).toBe('WARNING');
      expect(evaluation.complianceRate).toBe(85);

      // Critical status (under 80%)
      dbInstance.measurements = [
        { id: 'm4', kpiId: 'test-kpi-1', value: 75, date: '2026-01-15', registeredAt: '2026-01-15T00:00:00Z' }
      ]; // average = 75
      evaluation = goalService.evaluateCompliance('test-goal-1');
      expect(evaluation.status).toBe('CRITICAL');
      expect(evaluation.complianceRate).toBe(75);
    });

    it('should correctly evaluate LESS_EQUAL operator', () => {
      // Goal 2 operator is LESS_EQUAL and target is 2.
      // Under LESS_EQUAL, less is better (incident rates, delays etc).
      dbInstance.measurements = [
        { id: 'm1', kpiId: 'test-kpi-2', value: 1, date: '2026-01-05', registeredAt: '2026-01-05T00:00:00Z' },
        { id: 'm2', kpiId: 'test-kpi-2', value: 2, date: '2026-01-15', registeredAt: '2026-01-15T00:00:00Z' }
      ]; // average is 1.5. Meets goal (Excellent).

      let evaluation = goalService.evaluateCompliance('test-goal-2');
      expect(evaluation.averageValue).toBe(1.5);
      expect(evaluation.status).toBe('EXCELLENT');

      // Warning boundaries: exceeding target but within safe limit (target * 1.25) -> 2 * 1.25 = 2.5
      dbInstance.measurements = [
        { id: 'm3', kpiId: 'test-kpi-2', value: 2.3, date: '2026-01-20', registeredAt: '2026-01-10T00:00:00Z' }
      ]; // average is 2.3
      evaluation = goalService.evaluateCompliance('test-goal-2');
      expect(evaluation.status).toBe('WARNING');

      // Critical (> 2.5)
      dbInstance.measurements = [
        { id: 'm4', kpiId: 'test-kpi-2', value: 3.2, date: '2026-01-25', registeredAt: '2026-01-10T00:00:00Z' }
      ]; // average is 3.2
      evaluation = goalService.evaluateCompliance('test-goal-2');
      expect(evaluation.status).toBe('CRITICAL');
    });
  });
});
