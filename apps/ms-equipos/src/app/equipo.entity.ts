import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('equipos')
export class EquipoEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column()
    lider: string; // Nombre del responsable del equipo

    @Column()
    departamento: string; // Ej: Ventas, Operaciones, IT

    @Column({ default: 0 })
    cantidadIntegrantes: number;

    @CreateDateColumn()
    fechaCreacion: Date;
}