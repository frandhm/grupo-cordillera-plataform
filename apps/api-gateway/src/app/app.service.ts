import { Injectable, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
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
    const url = 'http://localhost:3001/api/kpis';
    try {
      const { data } = await firstValueFrom(this.httpService.get(url));
      return data;
    } catch (error) {
      // Log de error interno para el desarrollador
      console.error('Error conectando con MS-KPIs:', error.message);
      // Respuesta resiliente para el usuario
      throw new HttpException({
        status: HttpStatus.SERVICE_UNAVAILABLE,
        error: 'El servicio de KPIs no está disponible temporalmente.',
        sugerencia: 'Por favor, intente en unos minutos.'
      }, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async obtenerEquiposDesdeMicroservicio() {
    // El Gateway llama al puerto 3002 que es donde vive tu MS-Equipos
    const url = 'http://localhost:3003/api/equipos';
    const { data } = await firstValueFrom(this.httpService.get(url));
    return data;
  }
}