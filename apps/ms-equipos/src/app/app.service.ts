import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EquipoEntity } from './equipo.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(EquipoEntity)
    private readonly equipoRepository: Repository<EquipoEntity>,
  ) { }

  async crear(datos: Partial<EquipoEntity>): Promise<EquipoEntity> {
    const nuevoEquipo = this.equipoRepository.create(datos);
    return await this.equipoRepository.save(nuevoEquipo);
  }

  async obtenerTodos(): Promise<EquipoEntity[]> {
    return await this.equipoRepository.find();
  }
}