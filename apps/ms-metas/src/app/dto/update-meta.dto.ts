import { IsString, IsNumber, IsOptional, Min, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMetaDto {
  @ApiPropertyOptional({ example: 'Meta de ventas Q3 actualizada' })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiPropertyOptional({ example: 'ventas-sur' })
  @IsString()
  @IsOptional()
  areaId?: string;

  @ApiPropertyOptional({ example: 'uuid-del-kpi' })
  @IsString()
  @IsOptional()
  indicadorId?: string;

  @ApiPropertyOptional({ example: 12000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  valorObjetivo?: number;

  @ApiPropertyOptional({ example: 6000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  valorActual?: number;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsDateString()
  @IsOptional()
  fechaLimite?: string;
}
