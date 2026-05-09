import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KpiEntity } from './kpi.entity';

@Injectable()
export class AppService {
  // Aquí "inyectamos" el repositorio que nos permite hablar con Postgres
  constructor(
    @InjectRepository(KpiEntity)
    private readonly kpiRepository: Repository<KpiEntity>,
  ) { }

  async crearKpi(datos: any): Promise<KpiEntity> {
    try {
      // Intentamos guardar directamente los datos
      return await this.kpiRepository.save(datos);
    } catch (error) {
      console.error("Error detallado:", error);
      throw error;
    }
  }

  // Esto le dice a TypeScript que esperas un arreglo de objetos que tienen 
  // todo lo de KpiEntity MÁS los campos nuevos.
  async obtenerTodos(): Promise<any[]> {
    const kpis = await this.kpiRepository.find();

    // Aquí aplicamos la lógica de negocio para "romper silos" y dar valor
    return kpis.map(kpi => {
      // Simulamos una meta (esto después vendrá del microservicio de Rodrigo)
      const metaSimulada = 10000;
      const porcentaje = (kpi.valor / metaSimulada) * 100;

      return {
        ...kpi,
        cumplimiento: `${porcentaje.toFixed(2)}%`,
        estado: porcentaje >= 100 ? 'META CUMPLIDA' : 'EN PROGRESO'
      };
    });
  }
}