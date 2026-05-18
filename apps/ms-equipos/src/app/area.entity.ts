import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { EquipoEntity } from './equipo.entity';

@Entity('areas')
export class AreaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @OneToMany(() => EquipoEntity, (equipo) => equipo.area)
  equipos: EquipoEntity[];
}
