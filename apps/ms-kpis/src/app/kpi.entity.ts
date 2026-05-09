import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('kpis') // Esto creará la tabla 'kpis' en Postgres
export class KpiEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    nombre: string;

    @Column('float')
    valor: number;

    @Column()
    areaId: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fechaCreacion: Date;
}