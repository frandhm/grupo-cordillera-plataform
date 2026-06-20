/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { KPI, Measurement } from '../../types.js';
import dbInstance from '../db.js';

// --- MODEL ---
export class KpiModel implements KPI {
  public id: string;
  public name: string;
  public description: string;
  public unitOfMeasurement: string;
  public areaId: string;
  public createdAt: string;

  constructor(data: KPI) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.unitOfMeasurement = data.unitOfMeasurement;
    this.areaId = data.areaId;
    this.createdAt = data.createdAt;
  }

  public static validate(data: Partial<KPI>): string | null {
    if (!data.name || data.name.trim().length === 0) {
      return 'El nombre del indicador es obligatorio.';
    }
    if (!data.description || data.description.trim().length === 0) {
      return 'La descripción del indicador es obligatoria.';
    }
    if (!data.unitOfMeasurement || data.unitOfMeasurement.trim().length === 0) {
      return 'La unidad de medida es obligatoria.';
    }
    if (!data.areaId || data.areaId.trim().length === 0) {
      return 'La asociación a un área es obligatoria.';
    }
    return null;
  }
}

// --- CREATIONAL PATTERN: BUILDER ---
export class KpiBuilder {
  private tempKpi: Partial<KPI> = {};

  public setName(name: string): this {
    this.tempKpi.name = name.trim();
    return this;
  }

  public setDescription(description: string): this {
    this.tempKpi.description = description.trim();
    return this;
  }

  public setUnit(unit: string): this {
    this.tempKpi.unitOfMeasurement = unit.trim();
    return this;
  }

  public setAreaId(areaId: string): this {
    this.tempKpi.areaId = areaId;
    return this;
  }

  public build(): KpiModel {
    const error = KpiModel.validate(this.tempKpi);
    if (error) {
      throw new Error(error);
    }

    const newKpi: KPI = {
      id: this.tempKpi.id || `kpi-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: this.tempKpi.name!,
      description: this.tempKpi.description!,
      unitOfMeasurement: this.tempKpi.unitOfMeasurement!,
      areaId: this.tempKpi.areaId!,
      createdAt: this.tempKpi.createdAt || new Date().toISOString()
    };

    return new KpiModel(newKpi);
  }
}

// --- REPOSITORY ---
export class KpiRepository {
  public getAll(): KPI[] {
    return dbInstance.kpis;
  }

  public getById(id: string): KPI | null {
    const item = dbInstance.kpis.find(k => k.id === id);
    return item ? { ...item } : null;
  }

  public save(kpi: KPI): KPI {
    const list = dbInstance.kpis;
    const index = list.findIndex(k => k.id === kpi.id);
    if (index >= 0) {
      list[index] = kpi;
    } else {
      list.push(kpi);
    }
    dbInstance.kpis = list;
    return kpi;
  }

  public getMeasurementsByKpiId(kpiId: string): Measurement[] {
    return dbInstance.measurements
      .filter(m => m.kpiId === kpiId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  public saveMeasurement(measurement: Measurement): Measurement {
    const list = dbInstance.measurements;
    list.push(measurement);
    dbInstance.measurements = list;
    return measurement;
  }
}

// --- SERVICE ---
export class KpiService {
  private repo = new KpiRepository();

  public listKpis(): KPI[] {
    return this.repo.getAll();
  }

  public getKpiDetails(id: string): KPI | null {
    return this.repo.getById(id);
  }

  public createKpi(data: { name: string; description: string; unitOfMeasurement: string; areaId: string }): KPI {
    // Check if Area exists
    const areaExists = dbInstance.areas.some(a => a.id === data.areaId);
    if (!areaExists) {
      throw new Error(`El área asociada '${data.areaId}' no existe.`);
    }

    // Using CREATIONAL PATTERN: Builder
    const builder = new KpiBuilder()
      .setName(data.name)
      .setDescription(data.description)
      .setUnit(data.unitOfMeasurement)
      .setAreaId(data.areaId);

    const validatedKpi = builder.build();
    return this.repo.save(validatedKpi);
  }

  public updateKpi(id: string, data: Partial<KPI>): KPI {
    const existingKpi = this.repo.getById(id);
    if (!existingKpi) {
      throw new Error(`KPI con ID ${id} no encontrado.`);
    }

    const updated = {
      ...existingKpi,
      ...data,
      id // preserve original id
    };

    const validationErr = KpiModel.validate(updated);
    if (validationErr) {
      throw new Error(validationErr);
    }

    return this.repo.save(updated);
  }

  public getMeasurements(kpiId: string): Measurement[] {
    const kpi = this.repo.getById(kpiId);
    if (!kpi) {
      throw new Error(`KPI con ID ${kpiId} no existe.`);
    }
    return this.repo.getMeasurementsByKpiId(kpiId);
  }

  public registerMeasurement(kpiId: string, value: number, date: string, notes?: string): Measurement {
    const kpi = this.repo.getById(kpiId);
    if (!kpi) {
      throw new Error(`KPI con ID ${kpiId} no existe.`);
    }

    if (isNaN(value)) {
      throw new Error('El valor de medición debe ser un número.');
    }

    if (!date || date.trim().length === 0) {
      throw new Error('La fecha de la medición es requerida.');
    }

    const newMeasurement: Measurement = {
      id: `m-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      kpiId,
      value,
      date,
      registeredAt: new Date().toISOString(),
      notes: notes?.trim()
    };

    return this.repo.saveMeasurement(newMeasurement);
  }
}

// --- CONTROLLER ---
export class KpiController {
  private service = new KpiService();

  public getKpis = (req: any, res: any) => {
    try {
      const kpis = this.service.listKpis();
      return res.json(kpis);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  public getKpiById = (req: any, res: any) => {
    try {
      const { id } = req.params;
      const kpi = this.service.getKpiDetails(id);
      if (!kpi) {
        return res.status(404).json({ error: `KPI con ID ${id} no encontrado.` });
      }
      return res.json(kpi);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  public createKpiRoute = (req: any, res: any) => {
    try {
      const { name, description, unitOfMeasurement, areaId } = req.body;
      const newKpi = this.service.createKpi({ name, description, unitOfMeasurement, areaId });
      return res.status(201).json(newKpi);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };

  public updateKpiRoute = (req: any, res: any) => {
    try {
      const { id } = req.params;
      const kpi = this.service.updateKpi(id, req.body);
      return res.json(kpi);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };

  public getMeasurementsRoute = (req: any, res: any) => {
    try {
      const { id } = req.params;
      const measurements = this.service.getMeasurements(id);
      return res.json(measurements);
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  };

  public createMeasurementRoute = (req: any, res: any) => {
    try {
      const { id } = req.params; // kpiId
      const { value, date, notes } = req.body;
      const measurement = this.service.registerMeasurement(id, Number(value), date, notes);
      return res.status(201).json(measurement);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };
}
