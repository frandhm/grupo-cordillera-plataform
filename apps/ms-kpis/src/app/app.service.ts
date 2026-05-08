import { Injectable } from '@nestjs/common';
import { KpiEntity } from './kpi.entity'; // Importamos tu modelo de datos

@Injectable()
export class AppService {
  // Creamos un "arreglo" temporal para guardar los KPIs en la memoria de la Mac
  // mientras configuramos la base de datos real.
  private repositorioKpis: KpiEntity[] = [];

  // Función para guardar un nuevo KPI
  crearKpi(datos: any): KpiEntity {
    const nuevoKpi = new KpiEntity();
    nuevoKpi.id = Math.random().toString(36).substr(2, 9); // Generamos un ID al azar
    nuevoKpi.nombre = datos.nombre;
    nuevoKpi.valor = datos.valor;
    nuevoKpi.areaId = datos.areaId;
    nuevoKpi.fechaCreacion = new Date();

    this.repositorioKpis.push(nuevoKpi);
    console.log('KPI guardado con éxito:', nuevoKpi.nombre);
    return nuevoKpi;
  }

  // Función para listar todos los KPIs (Visibilidad en tiempo real)
  obtenerTodos(): KpiEntity[] {
    return this.repositorioKpis;
  }
}