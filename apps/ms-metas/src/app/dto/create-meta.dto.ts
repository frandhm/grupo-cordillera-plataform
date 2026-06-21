import { IsString, IsNumber, IsNotEmpty, IsOptional, Min, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMetaDto {
  @ApiProperty({ example: 'Meta de ventas Q3' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'ventas-sur' })
  @IsString()
  @IsNotEmpty()
  areaId: string;

  @ApiPropertyOptional({ example: 'uuid-del-kpi' })
  @IsString()
  @IsOptional()
  indicadorId?: string;

  @ApiProperty({ example: 10000 })
  @IsNumber()
  @Min(0)
  valorObjetivo: number;

  @ApiPropertyOptional({ example: 5000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  valorActual?: number;

  @ApiProperty({ example: '2025-12-31' })
  @IsDateString()
  fechaLimite: string;
}
