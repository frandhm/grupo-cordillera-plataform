import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { KpiEntity } from './kpi.entity';

@Entity('mediciones')
export class MedicionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  valor: number;

  @CreateDateColumn()
  fecha: Date;

  @ManyToOne(() => KpiEntity, (kpi) => kpi.mediciones)
  kpi: KpiEntity;
}
