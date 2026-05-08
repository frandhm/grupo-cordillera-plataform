import { Injectable } from '@nestjs/common';
import { KpiEntity } from './kpi.entity';

@Injectable()
export class AppService {
  private kpis: KpiEntity[] = []; // Por ahora usaremos memoria, luego TypeORM

  // Lógica para crear un nuevo KPI
  crearKpi(nuevoKpi: Partial<KpiEntity>) {
    const kpi = { ...nuevoKpi, id: Date.now().toString(), fechaCreacion: new Date() } as KpiEntity;
    this.kpis.push(kpi);
    return kpi;
  }

  // Lógica para obtener todos los KPIs (Visibilidad en tiempo real) [cite: 31]
  obtenerTodos() {
    return this.kpis;
  }
}