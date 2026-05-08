import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity() // Esto le dice a TypeORM que cree una tabla en la DB
export class KpiEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    nombre: string; // Ejemplo: "Ventas Mensuales"

    @Column('float')
    valor: number;

    @Column()
    areaId: string; // Conecta con el microservicio de Áreas [cite: 69]

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fechaCreacion: Date;
}