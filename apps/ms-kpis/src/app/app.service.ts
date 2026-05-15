import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KpiEntity } from './kpi.entity';
import { MedicionEntity } from './medicion.entity';

/* ── Patrón Factory Method ── */
class KpiFactory {
  static create(type: string, data: any): Partial<KpiEntity> {
    return {
      nombre: data.nombre,
      valor: data.valor,
      areaId: data.areaId,
      descripcion: data.descripcion || `Indicador de ${type}`,
      unidadMedicion: data.unidadMedicion || 'unidades',
    };
  }
}

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(KpiEntity)
    private readonly kpiRepository: Repository<KpiEntity>,
    @InjectRepository(MedicionEntity)
    private readonly medicionRepository: Repository<MedicionEntity>,
  ) { }

  async crearKpi(datos: any): Promise<KpiEntity> {
    const kpiData = KpiFactory.create('General', datos);
    const kpi = await this.kpiRepository.save(this.kpiRepository.create(kpiData));
    
    // Guardar medición inicial
    await this.medicionRepository.save(this.medicionRepository.create({
      valor: kpi.valor,
      kpi: kpi
    }));
    
    return kpi;
  }

  async obtenerTodos(): Promise<any[]> {
    const kpis = await this.kpiRepository.find();
    return kpis.map(kpi => {
      const metaSimulada = 10000;
      const porcentaje = (kpi.valor / metaSimulada) * 100;
      return {
        ...kpi,
        cumplimiento: `${porcentaje.toFixed(2)}%`,
        estado: porcentaje >= 100 ? 'META CUMPLIDA' : 'EN PROGRESO'
      };
    });
  }

  async obtenerPorId(id: string): Promise<KpiEntity> {
    const kpi = await this.kpiRepository.findOne({ where: { id } });
    if (!kpi) throw new NotFoundException('KPI no encontrado');
    return kpi;
  }

  async actualizarValor(id: string, nuevoValor: number) {
    const kpi = await this.kpiRepository.findOne({ where: { id } });
    if (!kpi) throw new NotFoundException('KPI no encontrado');

    const valorAnterior = kpi.valor;
    kpi.valor = Number(valorAnterior) + Number(nuevoValor);
    
    await this.kpiRepository.save(kpi);

    await this.medicionRepository.save(this.medicionRepository.create({
      valor: kpi.valor,
      kpi: kpi
    }));

    return kpi;
  }

  async obtenerHistorial(id: string) {
    return await this.medicionRepository.find({
      where: { kpi: { id } },
      order: { fecha: 'DESC' }
    });
  }

  async eliminarKpi(id: string) {
    const kpi = await this.kpiRepository.findOne({ where: { id } });
    if (!kpi) throw new NotFoundException('KPI no encontrado');
    await this.medicionRepository.delete({ kpi: { id } });
    await this.kpiRepository.remove(kpi);
    return { mensaje: 'KPI y su historial eliminados' };
  }
}