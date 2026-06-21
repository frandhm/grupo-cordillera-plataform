import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEquipoDto {
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
  areaId: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  cantidadIntegrantes: number;
}
