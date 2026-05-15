import { Injectable, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService
  ) { }

  async login(usuario: string, clave: string) {
    // JEFE (Acceso total)
    if (usuario === 'admin@cordillera.com' && clave === '123456') {
      const payload = { email: usuario, role: 'jefe' };
      return {
        access_token: await this.jwtService.signAsync(payload),
        mensaje: 'Bienvenido, Jefe del Sistema Cordillera'
      };
    }

    // GERENTE (Todo menos metas)
    if (usuario === 'gerente@cordillera.com' && clave === '123456') {
      const payload = { email: usuario, role: 'gerente' };
      return {
        access_token: await this.jwtService.signAsync(payload),
        mensaje: 'Panel de Gerencia - Grupo Cordillera'
      };
    }

    // VENDEDOR (Solo métricas)
    if (usuario === 'vendedor@cordillera.com' && clave === '123456') {
      const payload = { email: usuario, role: 'vendedor' };
      return {
        access_token: await this.jwtService.signAsync(payload),
        mensaje: 'Portal de Ventas - Grupo Cordillera'
      };
    }
    throw new UnauthorizedException('Credenciales incorrectas');
  }

  async obtenerKpisDesdeMicroservicio() {
    const url = 'http://localhost:3001/api/kpis';
    try {
      const { data } = await firstValueFrom(this.httpService.get(url));
      return data;
    } catch (error) {
      console.error('Error conectando con MS-KPIs:', error.message);
      throw new HttpException({
        status: HttpStatus.SERVICE_UNAVAILABLE,
        error: 'El servicio de KPIs no está disponible temporalmente.',
      }, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async obtenerEquiposDesdeMicroservicio() {
    const url = 'http://localhost:3003/api/equipos';
    try {
      const { data } = await firstValueFrom(this.httpService.get(url));
      return data;
    } catch (error) {
      console.error('Error conectando con MS-Equipos:', error.message);
      return [];
    }
  }

  // AGREGACIÓN BFF: Combina KPIs con sus Metas
  async obtenerResumenConsolidado() {
    const urlKpis = 'http://localhost:3001/api/kpis';
    const urlMetas = 'http://localhost:3002/api/metas';

    try {
      // Llamadas en paralelo para eficiencia
      const [resKpis, resMetas] = await Promise.all([
        firstValueFrom(this.httpService.get(urlKpis)),
        firstValueFrom(this.httpService.get(urlMetas))
      ]);

      const kpis = resKpis.data;
      const metas = resMetas.data;

      // Unimos cada KPI con su meta correspondiente
      return kpis.map(kpi => {
        const metaAsociada = metas.find(m => m.indicadorId === kpi.id);
        return {
          ...kpi,
          meta: metaAsociada || null,
          cumplimientoCalculado: metaAsociada 
            ? `${((kpi.valor / metaAsociada.valorObjetivo) * 100).toFixed(2)}%`
            : '0%'
        };
      });
    } catch (error) {
      console.error('Error al consolidar resumen:', error.message);
      throw new HttpException('Error al obtener datos consolidados', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async crearEquipo(datos: any) {
    const url = 'http://localhost:3003/api/equipos';
    try {
      const { data } = await firstValueFrom(this.httpService.post(url, datos));
      return data;
    } catch (error) {
      console.error('Error al crear equipo:', error.message);
      throw new Error('No se pudo crear el equipo');
    }
  }
}