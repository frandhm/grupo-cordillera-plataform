/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Area, Team, KPI, Goal } from '../../types.js';
import dbInstance from '../db.js';

// --- SERVICE FACADE FOR KPIs & GOALS INTEGRATION ---
export class AreaManagerFacade {
  /**
   * Fetches the KPIs assigned or created under a target area.
   */
  public getKpisForArea(areaId: string): KPI[] {
    return dbInstance.kpis.filter(k => k.areaId === areaId);
  }

  /**
   * Fetches corresponding goals for a set of KPIs.
   */
  public getGoalsByKpiIds(kpiIds: string[]): Goal[] {
    return dbInstance.goals.filter(g => kpiIds.includes(g.kpiId));
  }
}

// --- MODELS & VALIDATION ---
export class AreaModel implements Area {
  public id: string;
  public name: string;
  public description: string;
  public managerName?: string;
  public createdAt: string;

  constructor(data: Area) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.managerName = data.managerName;
    this.createdAt = data.createdAt;
  }

  public static validate(data: Partial<Area>): string | null {
    if (!data.name || data.name.trim().length === 0) {
      return 'El nombre del área es requerido.';
    }
    return null;
  }
}

export class TeamModel implements Team {
  public id: string;
  public name: string;
  public areaId: string;
  public memberCount: number;
  public createdAt: string;

  constructor(data: Team) {
    this.id = data.id;
    this.name = data.name;
    this.areaId = data.areaId;
    this.memberCount = data.memberCount;
    this.createdAt = data.createdAt;
  }

  public static validate(data: Partial<Team>): string | null {
    if (!data.name || data.name.trim().length === 0) {
      return 'El nombre del equipo es requerido.';
    }
    if (!data.areaId || data.areaId.trim().length === 0) {
      return 'La asociación de un equipo a un área es obligatoria.';
    }
    if (data.memberCount === undefined || isNaN(data.memberCount) || data.memberCount < 0) {
      return 'La cantidad de miembros del equipo debe ser un número igual o mayor a cero.';
    }
    return null;
  }
}

// --- REPOSITORY ---
export class AreaRepository {
  public getAreas(): Area[] {
    return dbInstance.areas;
  }

  public getAreaById(id: string): Area | null {
    const item = dbInstance.areas.find(a => a.id === id);
    return item ? { ...item } : null;
  }

  public saveArea(area: Area): Area {
    const list = dbInstance.areas;
    const index = list.findIndex(a => a.id === area.id);
    if (index >= 0) {
      list[index] = area;
    } else {
      list.push(area);
    }
    dbInstance.areas = list;
    return area;
  }

  public getTeams(): Team[] {
    return dbInstance.teams;
  }

  public getTeamsByAreaId(areaId: string): Team[] {
    return dbInstance.teams.filter(t => t.areaId === areaId);
  }

  public getTeamById(id: string): Team | null {
    const item = dbInstance.teams.find(t => t.id === id);
    return item ? { ...item } : null;
  }

  public saveTeam(team: Team): Team {
    const list = dbInstance.teams;
    const index = list.findIndex(t => t.id === team.id);
    if (index >= 0) {
      list[index] = team;
    } else {
      list.push(team);
    }
    dbInstance.teams = list;
    return team;
  }
}

// --- SERVICE ---
export class AreaService {
  private repo = new AreaRepository();
  private facade = new AreaManagerFacade();

  public listAreas(): Area[] {
    return this.repo.getAreas();
  }

  public getArea(id: string): Area | null {
    return this.repo.getAreaById(id);
  }

  public createArea(data: { name: string; description: string; managerName?: string }): Area {
    const err = AreaModel.validate(data);
    if (err) {
      throw new Error(err);
    }

    const newArea: Area = {
      id: `area-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: data.name.trim(),
      description: data.description?.trim() || '',
      managerName: data.managerName?.trim() || 'Sin asignar',
      createdAt: new Date().toISOString()
    };

    return this.repo.saveArea(newArea);
  }

  public listTeams(): Team[] {
    return this.repo.getTeams();
  }

  public getTeamsByArea(areaId: string): Team[] {
    const area = this.repo.getAreaById(areaId);
    if (!area) {
      throw new Error(`El área con ID ${areaId} no existe.`);
    }
    return this.repo.getTeamsByAreaId(areaId);
  }

  public createTeam(data: { name: string; areaId: string; memberCount: number }): Team {
    // Check if Area exists
    const area = this.repo.getAreaById(data.areaId);
    if (!area) {
      throw new Error(`Error de Integración: El área escogida '${data.areaId}' no existe.`);
    }

    const err = TeamModel.validate(data);
    if (err) {
      throw new Error(err);
    }

    const newTeam: Team = {
      id: `team-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: data.name.trim(),
      areaId: data.areaId,
      memberCount: data.memberCount,
      createdAt: new Date().toISOString()
    };

    return this.repo.saveTeam(newTeam);
  }

  // Uses facade to merge indicators under the area structure
  public getIndicatorsForArea(areaId: string): KPI[] {
    const area = this.repo.getAreaById(areaId);
    if (!area) {
      throw new Error(`El área con ID ${areaId} no existe.`);
    }
    return this.facade.getKpisForArea(areaId);
  }
}

// --- CONTROLLER ---
export class AreaController {
  private service = new AreaService();

  public getAreas = (req: any, res: any) => {
    try {
      const areas = this.service.listAreas();
      return res.json(areas);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  public getAreaById = (req: any, res: any) => {
    try {
      const { id } = req.params;
      const area = this.service.getArea(id);
      if (!area) {
        return res.status(404).json({ error: `Área con ID ${id} no encontrada.` });
      }
      return res.json(area);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  public createAreaRoute = (req: any, res: any) => {
    try {
      const { name, description, managerName } = req.body;
      const area = this.service.createArea({ name, description, managerName });
      return res.status(201).json(area);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };

  public getTeams = (req: any, res: any) => {
    try {
      const { areaId } = req.query;
      if (areaId) {
        return res.json(this.service.getTeamsByArea(areaId));
      }
      return res.json(this.service.listTeams());
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  public createTeamRoute = (req: any, res: any) => {
    try {
      const { name, areaId, memberCount } = req.body;
      const team = this.service.createTeam({ name, areaId, memberCount: Number(memberCount) });
      return res.status(201).json(team);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };

  public getAreaIndicatorsRoute = (req: any, res: any) => {
    try {
      const { id } = req.params; // areaId
      const indicators = this.service.getIndicatorsForArea(id);
      return res.json(indicators);
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  };
}
