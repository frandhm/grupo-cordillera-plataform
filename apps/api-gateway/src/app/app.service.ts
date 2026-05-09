import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService // Inyectamos el servicio de JWT
  ) { }

  async login(usuario: string, clave: string) {
    // Simulamos un usuario de la base de datos del Grupo Cordillera
    if (usuario === 'admin@cordillera.com' && clave === '123456') {
      const payload = { email: usuario, role: 'admin' };

      return {
        access_token: await this.jwtService.signAsync(payload),
        mensaje: 'Bienvenido al Sistema de Gestión Cordillera'
      };
    }

    throw new UnauthorizedException('Credenciales incorrectas');
  }

  // Esta función es el "puente" hacia tu microservicio de KPIs
  async obtenerKpisDesdeMicroservicio() {
    // El Gateway llama al puerto 3001 que es donde vive tu MS-KPIs
    const url = 'http://localhost:3001/api/kpis';
    const { data } = await firstValueFrom(this.httpService.get(url));
    return data;
  }
}