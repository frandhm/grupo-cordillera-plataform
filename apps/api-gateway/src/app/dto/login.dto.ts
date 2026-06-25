import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'admin@cordillera.com' })
    @IsString()
    @IsNotEmpty()
    usuario: string;

    @ApiProperty({ example: '123456' })
    @IsString()
    @IsNotEmpty()
    clave: string;
}