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
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(datos.areaId);
      let area = isUuid 
        ? await this.areaRepository.findOne({ where: { id: datos.areaId } })
        : await this.areaRepository.findOne({ where: { nombre: datos.areaId } });

      if (!area) {
        area = await this.areaRepository.save(this.areaRepository.create({ nombre: datos.areaId }));
      }
      datos.areaId = area.id;
      datos.area = area;
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