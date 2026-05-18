import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKpiDto {
    @ApiProperty({ example: 'Ventas Retail' })
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @ApiProperty({ example: 15000 })
    @IsNumber()
    @Min(0) // No permitimos KPIs negativos
    valor: number;

    @ApiProperty({ example: 'ventas-sur' })
    @IsString()
    @IsNotEmpty()
    areaId: string;
}