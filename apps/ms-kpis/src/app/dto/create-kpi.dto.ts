import { IsString, IsNumber, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateKpiDto {
    @ApiProperty({ example: 'Producción Diaria de Cobre' })
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @ApiProperty({ example: 120 })
    @IsNumber()
    @Min(0)
    valor: number;

    @ApiProperty({ example: 'operaciones-mineras' })
    @IsString()
    @IsNotEmpty()
    areaId: string;

    @ApiPropertyOptional({ example: 'Toneladas de concentrado de cobre extraídas diariamente' })
    @IsOptional()
    @IsString()
    descripcion?: string;

    @ApiPropertyOptional({ example: 'Tons' })
    @IsOptional()
    @IsString()
    unidadMedicion?: string;

    @ApiPropertyOptional({ example: 'uuid-del-equipo' })
    @IsOptional()
    @IsString()
    equipoId?: string;

    @ApiPropertyOptional({ example: 'Juan Pérez' })
    @IsOptional()
    @IsString()
    responsable?: string;
}
