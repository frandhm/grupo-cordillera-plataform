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
      equipoId: data.equipoId || null,
      responsable: data.responsable || null,
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

  async obtenerTodos(): Promise<KpiEntity[]> {
    return await this.kpiRepository.find({ relations: ['mediciones'] });
  }

  async obtenerPorId(id: string): Promise<KpiEntity> {
    const kpi = await this.kpiRepository.findOne({ where: { id }, relations: ['mediciones'] });
    if (!kpi) throw new NotFoundException('KPI no encontrado');
    return kpi;
  }

  async actualizarValor(id: string, nuevoValor: number) {
    const kpi = await this.kpiRepository.findOne({ where: { id } });
    if (!kpi) throw new NotFoundException('KPI no encontrado');

    // Reemplazar el valor actual, no acumular
    kpi.valor = Number(nuevoValor);

    await this.kpiRepository.save(kpi);

    // Guardar la nueva medición en el historial
    await this.medicionRepository.save(this.medicionRepository.create({
      valor: kpi.valor,
      kpi: kpi
    }));

    return kpi;
  }

  async obtenerHistorial(id: string) {
    return await this.medicionRepository.find({
      where: { kpi: { id } },
      order: { fecha: 'ASC' }
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
