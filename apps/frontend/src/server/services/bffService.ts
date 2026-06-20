/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DashboardOverview, KpiDetailedInfo, AreaPerformanceSummary, KPI, Goal, Area, Team, Measurement } from '../../types.js';
import { KpiService } from './kpiService.js';
import { GoalService } from './goalService.js';
import { AreaService } from './areaService.js';

export class BffFacade {
  private kpiService = new KpiService();
  private goalService = new GoalService();
  private areaService = new AreaService();

  /**
   * Aggregates full details for a single KPI.
   */
  public compileKpiDetailed(kpi: KPI): KpiDetailedInfo {
    const areas = this.areaService.listAreas();
    const area = areas.find(a => a.id === kpi.areaId);

    // Find latest goal for this KPI
    const goals = this.goalService.listGoals();
    const kpiGoals = goals.filter(g => g.kpiId === kpi.id);
    let latestGoal: Goal | undefined;
    if (kpiGoals.length > 0) {
      // Sort goals by date or creation to get the latest
      latestGoal = kpiGoals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    }

    // Get measurements
    const measurements = this.kpiService.getMeasurements(kpi.id);

    let status: KpiDetailedInfo['status'] = 'NO_DATA';
    let complianceRate = 0;

    if (latestGoal) {
      const evalResult = this.goalService.evaluateCompliance(latestGoal.id);
      status = evalResult.status;
      complianceRate = evalResult.complianceRate;
    }

    return {
      kpi,
      area,
      latestGoal,
      measurements,
      complianceRate,
      status
    };
  }

  /**
   * Retrieves all detailed KPIs in the organization.
   */
  public getDetailedKpis(): KpiDetailedInfo[] {
    const kpis = this.kpiService.listKpis();
    return kpis.map(k => this.compileKpiDetailed(k));
  }

  /**
   * Gets a fully consolidated report on the performance of all areas.
   */
  public getAreasPerformance(): AreaPerformanceSummary[] {
    const areas = this.areaService.listAreas();
    const teams = this.areaService.listTeams();
    const detailedKpis = this.getDetailedKpis();

    return areas.map(area => {
      const areaTeams = teams.filter(t => t.areaId === area.id);
      const areaKpis = detailedKpis.filter(k => k.kpi.areaId === area.id);

      // Filter active goals from KPIs with data or goals
      const kpisWithGoals = areaKpis.filter(k => k.latestGoal !== undefined);
      const activeGoalsCount = kpisWithGoals.length;

      // Calculate average compliance score across goals with measurements
      const complianceKpis = kpisWithGoals.filter(k => k.status !== 'NO_DATA');
      const totalCompliance = complianceKpis.reduce((acc, curr) => acc + (curr.complianceRate || 0), 0);
      const avgCompliance = complianceKpis.length > 0 ? Math.round(totalCompliance / complianceKpis.length) : 100;

      return {
        area,
        teams: areaTeams,
        kpisCount: areaKpis.length,
        activeGoalsCount,
        averageCompliance: avgCompliance,
        kpiDetails: areaKpis
      };
    });
  }

  /**
   * Aggregates overarching company metrics for a top-level dashboard.
   */
  public getDashboardOverview(): DashboardOverview {
    const kpis = this.kpiService.listKpis();
    const goals = this.goalService.listGoals();
    const areas = this.areaService.listAreas();
    const teams = this.areaService.listTeams();
    const detailedKpis = this.getDetailedKpis();

    // Group KPIs by current status
    const kpisByStatus = {
      excellent: 0,
      warning: 0,
      critical: 0,
      noData: 0
    };

    let totalComplianceSum = 0;
    let compliantGoalsCount = 0;

    detailedKpis.forEach(item => {
      if (item.status === 'EXCELLENT') {
        kpisByStatus.excellent++;
        totalComplianceSum += item.complianceRate || 0;
        compliantGoalsCount++;
      } else if (item.status === 'WARNING') {
        kpisByStatus.warning++;
        totalComplianceSum += item.complianceRate || 0;
        compliantGoalsCount++;
      } else if (item.status === 'CRITICAL') {
        kpisByStatus.critical++;
        totalComplianceSum += item.complianceRate || 0;
        compliantGoalsCount++;
      } else {
        kpisByStatus.noData++;
      }
    });

    const averageGlobalCompliance = compliantGoalsCount > 0 ? Math.round(totalComplianceSum / compliantGoalsCount) : 100;

    // Get all measurements and find 5 most recent
    const allMeasurements: { measurement: Measurement; kpiName: string; unit: string }[] = [];
    kpis.forEach(k => {
      const mList = this.kpiService.getMeasurements(k.id);
      mList.forEach(m => {
        allMeasurements.push({
          measurement: m,
          kpiName: k.name,
          unit: k.unitOfMeasurement
        });
      });
    });

    const recentMeasurements = allMeasurements
      .sort((a, b) => new Date(b.measurement.registeredAt).getTime() - new Date(a.measurement.registeredAt).getTime())
      .slice(0, 5);

    return {
      totalKpis: kpis.length,
      totalGoals: goals.length,
      totalAreas: areas.length,
      totalTeams: teams.length,
      averageGlobalCompliance,
      kpisByStatus,
      recentMeasurements
    };
  }
}

// --- BFF CONTROLLER ---
export class BffController {
  private bffFacade = new BffFacade();

  public getDashboard = (req: any, res: any) => {
    try {
      const summary = this.bffFacade.getDashboardOverview();
      return res.json(summary);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  public getKpisDetailed = (req: any, res: any) => {
    try {
      const details = this.bffFacade.getDetailedKpis();
      return res.json(details);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  public getAreasPerformanceRoute = (req: any, res: any) => {
    try {
      const performance = this.bffFacade.getAreasPerformance();
      return res.json(performance);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };
}
