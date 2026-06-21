import { IsString, IsNumber, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateKpiDto {
  @ApiProperty({ example: 'Ventas Retail' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 15000 })
  @IsNumber()
  @Min(0)
  valor: number;

  @ApiProperty({ example: 'ventas-sur' })
  @IsString()
  @IsNotEmpty()
  areaId: string;

  @ApiPropertyOptional({ example: 'Indicador de ventas del área sur' })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({ example: 'unidades' })
  @IsString()
  @IsOptional()
  unidadMedicion?: string;

  @ApiPropertyOptional({ example: '1' })
  @IsString()
  @IsOptional()
  equipoId?: string;

  @ApiPropertyOptional({ example: 'Juan Pérez' })
  @IsString()
  @IsOptional()
  responsable?: string;
}
