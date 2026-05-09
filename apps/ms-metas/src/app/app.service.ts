import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetaEntity } from './meta.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(MetaEntity)
    private readonly metaRepository: Repository<MetaEntity>,
  ) {}

  async crearMeta(datos: any): Promise<MetaEntity> {
    const estado = this.calcularEstado(datos.valorActual ?? 0, datos.valorObjetivo, datos.fechaLimite);
    return await this.metaRepository.save({ ...datos, estado });
  }

  async obtenerTodas(): Promise<any[]> {
    const metas = await this.metaRepository.find();
    return metas.map((meta) => {
      const porcentaje = (meta.valorActual / meta.valorObjetivo) * 100;
      return {
        ...meta,
        porcentajeCumplimiento: `${porcentaje.toFixed(2)}%`,
        estado: this.calcularEstado(meta.valorActual, meta.valorObjetivo, meta.fechaLimite),
      };
    });
  }

  async obtenerPorId(id: string): Promise<any> {
    const meta = await this.metaRepository.findOne({ where: { id } });
    if (!meta) throw new NotFoundException(`Meta con id ${id} no encontrada`);
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