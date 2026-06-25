import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetaEntity } from './meta.entity';
import { KpiApiFacade } from './kpi-api.facade';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(MetaEntity)
    private readonly metaRepository: Repository<MetaEntity>,
    private readonly kpiApiFacade: KpiApiFacade,
  ) {}

  async crearMeta(datos: any): Promise<MetaEntity> {
    // Validar que el indicador exista si se vincula uno
    if (datos.indicadorId) {
      await this.kpiApiFacade.validarIndicador(datos.indicadorId);
    }

    const estado = this.calcularEstado(0, datos.valorObjetivo, datos.operador ?? '>=', datos.fechaFin);
    return await this.metaRepository.save({ ...datos, estado });
  }

  async obtenerTodas(): Promise<any[]> {
    const metas = await this.metaRepository.find();

    const promesas = metas.map(async (meta) => {
      return await this.enriquecerMeta(meta);
    });

    return Promise.all(promesas);
  }

  async obtenerPorId(id: string): Promise<any> {
    const meta = await this.metaRepository.findOne({ where: { id } });
    if (!meta) throw new NotFoundException(`Meta con id ${id} no encontrada`);
    return await this.enriquecerMeta(meta);
  }

  async actualizarMeta(id: string, datos: any): Promise<MetaEntity> {
    const meta = await this.metaRepository.findOne({ where: { id } });
    if (!meta) throw new NotFoundException(`Meta con id ${id} no encontrada`);

    if (datos.indicadorId && datos.indicadorId !== meta.indicadorId) {
      await this.kpiApiFacade.validarIndicador(datos.indicadorId);
    }

    const actualizado = { ...meta, ...datos };
    return await this.metaRepository.save(actualizado);
  }

  async eliminarMeta(id: string): Promise<{ mensaje: string }> {
    const meta = await this.metaRepository.findOne({ where: { id } });
    if (!meta) throw new NotFoundException(`Meta con id ${id} no encontrada`);
    await this.metaRepository.remove(meta);
    return { mensaje: `Meta ${id} eliminada correctamente` };
  }

  // ── Lógica privada ────────────────────────────────────────────

  private async enriquecerMeta(meta: MetaEntity): Promise<any> {
    let tasaCumplimiento = 0;
    let valorPromedio: number | null = null;
    let totalMediciones = 0;

    if (meta.indicadorId) {
      try {
        // Filtrar mediciones dentro del período de la meta
        const historial = await this.kpiApiFacade.obtenerHistorial(meta.indicadorId);
        const medicionesEnPeriodo = historial.filter((m: any) => {
          const fechaMedicion = new Date(m.fecha);
          return (
            fechaMedicion >= new Date(meta.fechaInicio) &&
            fechaMedicion <= new Date(meta.fechaFin)
          );
        });

        totalMediciones = medicionesEnPeriodo.length;

        if (totalMediciones > 0) {
          const suma = medicionesEnPeriodo.reduce((acc: number, m: any) => acc + m.valor, 0);
          valorPromedio = suma / totalMediciones;
          tasaCumplimiento = this.calcularTasaCumplimiento(valorPromedio, meta.valorObjetivo, meta.operador);
        }
      } catch (e) {
        console.warn(`No se pudo calcular cumplimiento para meta ${meta.id}:`, e.message);
      }
    }

    const estado = this.calcularEstado(tasaCumplimiento, meta.valorObjetivo, meta.operador, meta.fechaFin);

    return {
      ...meta,
      valorPromedio,
      totalMediciones,
      tasaCumplimiento: parseFloat(tasaCumplimiento.toFixed(2)),
      estado,
    };
  }

  /**
   * Calcula la tasa de cumplimiento según el operador:
   * '>=' → mayor es mejor: (promedio / objetivo) * 100
   * '<=' → menor es mejor: (objetivo / promedio) * 100  (se invierte porque menos = mejor)
   * '='  → cercanía al objetivo: 100 - |diferencia%|
   */
  private calcularTasaCumplimiento(promedio: number, objetivo: number, operador: string): number {
    if (objetivo === 0) return 0;

    if (operador === '<=') {
      // Ej: accidentes — objetivo es 1.5, promedio es 1.1 → 136% (supera el objetivo)
      return Math.min((objetivo / promedio) * 100, 200);
    }

    if (operador === '=') {
      const diferencia = Math.abs((promedio - objetivo) / objetivo) * 100;
      return Math.max(100 - diferencia, 0);
    }

    // '>=' por defecto
    return Math.min((promedio / objetivo) * 100, 200);
  }

  /**
   * Estado basado en tasa de cumplimiento y si el período ya venció:
   * >= 100% → EXCELENTE
   * >= 70%  → EN_PROGRESO
   * < 70% y período vencido → NO_CUMPLIDA
   * < 70% y período vigente → EN_PROGRESO
   */
  private calcularEstado(tasa: number, _objetivo: number, _operador: string, fechaFin: string): string {
    if (tasa >= 100) return 'EXCELENTE';
    if (new Date(fechaFin) < new Date()) return 'NO_CUMPLIDA';
    return 'EN_PROGRESO';
  }
}
