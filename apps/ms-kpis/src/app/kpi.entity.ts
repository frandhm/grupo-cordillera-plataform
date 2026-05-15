import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { MedicionEntity } from './medicion.entity';

@Entity('kpis')
export class KpiEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    nombre: string;

    @Column('float')
    valor: number;

    @Column()
    areaId: string;

    @Column({ nullable: true })
    descripcion: string;

    @Column({ default: 'unidades' })
    unidadMedicion: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fechaCreacion: Date;

    @OneToMany(() => MedicionEntity, (medicion) => medicion.kpi)
    mediciones: MedicionEntity[];
}