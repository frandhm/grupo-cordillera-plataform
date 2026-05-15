import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EquipoEntity } from './equipo.entity';
import { AreaEntity } from './area.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(EquipoEntity)
    private readonly equipoRepository: Repository<EquipoEntity>,
    @InjectRepository(AreaEntity)
    private readonly areaRepository: Repository<AreaEntity>,
  ) { }

  async crear(datos: Partial<EquipoEntity>): Promise<EquipoEntity> {
    // Verificar si el área existe o crearla (auto-gestión simple para el proyecto)
    if (datos.areaId) {
      let area = await this.areaRepository.findOne({ where: { id: datos.areaId } });
      if (!area) {
        area = await this.areaRepository.save(this.areaRepository.create({ id: datos.areaId, nombre: `Área ${datos.areaId}` }));
      }
    }
    const nuevoEquipo = this.equipoRepository.create(datos);
    return await this.equipoRepository.save(nuevoEquipo);
  }

  async obtenerTodos(): Promise<EquipoEntity[]> {
    return await this.equipoRepository.find();
  }

  /* Gestión de Áreas */
  async obtenerAreas() {
    return await this.areaRepository.find();
  }

  async crearArea(nombre: string) {
    const area = this.areaRepository.create({ nombre });
    return await this.areaRepository.save(area);
  }
}