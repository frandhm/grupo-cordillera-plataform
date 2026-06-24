import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('metas')
export class MetaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  areaId: string;

  @Column({ nullable: true })
  equipoId: string;

  @Column({ nullable: true })
  indicadorId: string;

  // Período legible (ej: "Semestre 1 2026")
  @Column()
  periodo: string;

  @Column({ type: 'date' })
  fechaInicio: string;

  @Column({ type: 'date' })
  fechaFin: string;

  // Valor numérico objetivo (ej: 120, 1.5)
  @Column('float')
  valorObjetivo: number;

  // Operador de comparación: '>=' (mayor es mejor), '<=' (menor es mejor), '='
  @Column({ default: '>=' })
  operador: string;

  // Unidad de medida para mostrar en UI (ej: "Tons", "IF", "%", "CLP")
  @Column({ default: 'unidades' })
  unidad: string;

  // Descripción narrativa del objetivo (ej: "Mantener un promedio diario superior a 120 tons")
  @Column({ nullable: true })
  descripcionObjetivo: string;

  // Estado calculado dinámicamente; se persiste como caché
  @Column({ default: 'EN_PROGRESO' })
  estado: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion: Date;
}
