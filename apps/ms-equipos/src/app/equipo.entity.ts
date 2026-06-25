import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { AreaEntity } from './area.entity';

@Entity('equipos')
export class EquipoEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    nombre: string;

    @Column()
    lider: string;

    @Column()
    areaId: string;

    @ManyToOne(() => AreaEntity, (area) => area.equipos)
    area: AreaEntity;

    @Column({ default: 0 })
    cantidadIntegrantes: number;

    @CreateDateColumn()
    fechaCreacion: Date;
}
