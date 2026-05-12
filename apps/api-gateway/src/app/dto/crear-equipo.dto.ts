import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearEquipoDto {
  @ApiProperty({ example: 'Ventas Norte' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'Scarleth' })
  @IsString()
  @IsNotEmpty()
  lider: string;

  @ApiProperty({ example: 'Comercial' })
  @IsString()
  @IsNotEmpty()
  departamento: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  cantidadIntegrantes: number;
}