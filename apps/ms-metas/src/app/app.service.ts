import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetaEntity } from './meta.entity';
import { KpiApiFacade } from './kpi-api.facade';
import { KpiAdapter } from './kpi.adapter';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(MetaEntity)
    private readonly metaRepository: Repository<MetaEntity>,
    private readonly kpiApiFacade: KpiApiFacade,
  ) {}

  async crearMeta(datos: any): Promise<MetaEntity> {
    // REGLA DE NEGOCIO: Validar que el indicador exista
    if (datos.indicadorId) {
      await this.kpiApiFacade.validarIndicador(datos.indicadorId);
      // Opcional: Si no envían valor actual, lo traemos del microservicio y lo adaptamos
      if (datos.valorActual === undefined || datos.valorActual === 0) {
        const raw = await this.kpiApiFacade.obtenerKpiRaw(datos.indicadorId);
        if (raw) {
          const adapted = KpiAdapter.adapt(raw);
          datos.valorActual = adapted.valorActual;
        }
      }
    }

    const estado = this.calcularEstado(datos.valorActual ?? 0, datos.valorObjetivo, datos.fechaLimite);
    return await this.metaRepository.save({ ...datos, estado });
  }

  async obtenerTodas(): Promise<any[]> {
    const metas = await this.metaRepository.find();
    
    // Sincronizar con MS-KPIs en tiempo real para todas las metas que tengan link
    const promesas = metas.map(async (meta) => {
      if (meta.indicadorId) {
        try {
          const raw = await this.kpiApiFacade.obtenerKpiRaw(meta.indicadorId);
          if (raw) {
            const adapted = KpiAdapter.adapt(raw);
            meta.valorActual = adapted.valorActual;
          }
        } catch (e) {
          console.warn(`No se pudo refrescar KPI ${meta.indicadorId} para meta ${meta.id}`);
        }
      }
      
      const porcentaje = (meta.valorActual / meta.valorObjetivo) * 100;
      return {
        ...meta,
        porcentajeCumplimiento: `${porcentaje.toFixed(2)}%`,
        estado: this.calcularEstado(meta.valorActual, meta.valorObjetivo, meta.fechaLimite),
      };
    });

    return Promise.all(promesas);
  }

  async obtenerPorId(id: string): Promise<any> {
    const meta = await this.metaRepository.findOne({ where: { id } });
    if (!meta) throw new NotFoundException(`Meta con id ${id} no encontrada`);
    
    // Si tiene indicadorId, refrescamos el valor actual desde el MS-KPIs usando el Adapter
    if (meta.indicadorId) {
      const raw = await this.kpiApiFacade.obtenerKpiRaw(meta.indicadorId);
      if (raw) {
        const adapted = KpiAdapter.adapt(raw);
        meta.valorActual = adapted.valorActual;
      }
    }

    const porcentaje = (meta.valorActual / meta.valorObjetivo) * 100;
    return {
      ...meta,
      porcentajeCumplimiento: `${porcentaje.toFixed(2)}%`,
      estado: this.calcularEstado(meta.valorActual, meta.valorObjetivo, meta.fechaLimite),
    };
  }

  async actualizarMeta(id: string, datos: any): Promise<MetaEntity> {
    const meta = await this.metaRepository.findOne({ where: { id } });
    if (!meta) throw new NotFoundException(`Meta con id ${id} no encontrada`);

    if (datos.indicadorId && datos.indicadorId !== meta.indicadorId) {
      await this.kpiApiFacade.validarIndicador(datos.indicadorId);
    }

    const actualizado = { ...meta, ...datos };
    actualizado.estado = this.calcularEstado(actualizado.valorActual, actualizado.valorObjetivo, actualizado.fechaLimite);
    return await this.metaRepository.save(actualizado);
  }

  async eliminarMeta(id: string): Promise<{ mensaje: string }> {
    const meta = await this.metaRepository.findOne({ where: { id } });
    if (!meta) throw new NotFoundException(`Meta con id ${id} no encontrada`);
    await this.metaRepository.remove(meta);
    return { mensaje: `Meta ${id} eliminada correctamente` };
  }

  private calcularEstado(valorActual: number, valorObjetivo: number, fechaLimite: string): string {
    const porcentaje = (valorActual / valorObjetivo) * 100;
    if (porcentaje >= 100) return 'CUMPLIDA';
    if (new Date(fechaLimite) < new Date()) return 'NO_CUMPLIDA';
    return 'EN_PROGRESO';
  }
}