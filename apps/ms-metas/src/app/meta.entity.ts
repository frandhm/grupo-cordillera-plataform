import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('metas')
export class MetaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  areaId: string;

  @Column('float')
  valorObjetivo: number;

  @Column('float', { default: 0 })
  valorActual: number;

  @Column({ default: 'EN_PROGRESO' })
  estado: string;

  @Column({ type: 'date' })
  fechaLimite: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion: Date;
}
