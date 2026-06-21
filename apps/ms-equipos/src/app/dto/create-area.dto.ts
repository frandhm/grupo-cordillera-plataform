import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAreaDto {
  @ApiProperty({ example: 'Comercial' })
  @IsString()
  @IsNotEmpty()
  nombre: string;
}
