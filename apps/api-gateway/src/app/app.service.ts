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

  private logs: any[] = [
    { id: 1, event: 'LOGIN_SUCCESS', user: 'admin@cordillera.com', detail: 'Inicio de sesión exitoso', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  ];

  async addLog(event: string, user: string, detail: string) {
    const newLog = {
      id: this.logs.length + 1,
      event,
      user,
      detail,
      timestamp: new Date().toISOString()
    };
    this.logs.unshift(newLog);
  }

  async login(usuario: string, clave: string) {
    let role = '';
    if (usuario === 'admin@cordillera.com' && clave === '123456') {
      role = 'jefe';
    } else if (usuario === 'gerente@cordillera.com' && clave === '123456') {
      role = 'gerente';
    } else if (usuario === 'vendedor@cordillera.com' && clave === '123456') {
      role = 'vendedor';
    }

    if (role) {
      await this.addLog('LOGIN_SUCCESS', usuario, `Inicio de sesión con rol ${role}`);
      const payload = { email: usuario, role: role };
      return {
        access_token: await this.jwtService.signAsync(payload),
        mensaje: `Bienvenido, ${role} del Sistema Cordillera`
      };
    }

    await this.addLog('LOGIN_FAILURE', usuario, 'Intento de acceso fallido');
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

  async crearKpi(datos: any, userEmail: string) {
    const urlEquipos = 'http://localhost:3003/api/equipos';
    const urlKpis = 'http://localhost:3001/api/kpis';

    // Validar que el equipo existe (si se proporcionó un equipoId)
    if (datos.equipoId) {
      try {
        const { data: equipos } = await firstValueFrom(this.httpService.get(urlEquipos));
        // Equipos ahora usan UUID, comparación directa de strings
        const equipoExiste = equipos.some((e: any) => e.id === datos.equipoId);

        if (!equipoExiste) {
          await this.addLog('KPI_CREATE_ERROR', userEmail, `Intento de crear KPI con equipo inexistente: ${datos.equipoId}`);
          throw new HttpException(`El equipo con ID "${datos.equipoId}" no existe.`, HttpStatus.BAD_REQUEST);
        }
      } catch (e) {
        if (e instanceof HttpException) throw e;
        console.error('Error validando equipo:', e.message);
        await this.addLog('SYSTEM_WARNING', 'System', 'ms-equipos no disponible para validación');
      }
    }

    // Crear el KPI
    try {
      const { data: nuevoKpi } = await firstValueFrom(this.httpService.post(urlKpis, datos));
      await this.addLog('KPI_CREATED', userEmail, `KPI "${datos.nombre}" creado exitosamente`);
      return nuevoKpi;
    } catch (error) {
      console.error('Error al crear KPI:', error.message);
      throw new HttpException('Error al crear el KPI en el microservicio', HttpStatus.INTERNAL_SERVER_ERROR);
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

  // AGREGACIÓN BFF: Combina KPIs con sus Metas (usa tasaCumplimiento del ms-metas)
  async obtenerResumenConsolidado() {
    const urlKpis = 'http://localhost:3001/api/kpis';
    const urlMetas = 'http://localhost:3002/api/metas';

    try {
      const [resKpis, resMetas] = await Promise.all([
        firstValueFrom(this.httpService.get(urlKpis)),
        firstValueFrom(this.httpService.get(urlMetas))
      ]);

      const kpis = resKpis.data;
      const metas = resMetas.data;

      // Unimos cada KPI con su meta correspondiente
      return kpis.map((kpi: any) => {
        const metaAsociada = metas.find((m: any) => m.indicadorId === kpi.id);
        return {
          ...kpi,
          meta: metaAsociada || null,
          // Usar tasaCumplimiento calculada por ms-metas; si no hay meta, mostrar 0%
          cumplimientoCalculado: metaAsociada
            ? `${metaAsociada.tasaCumplimiento?.toFixed(2) ?? 0}%`
            : '0%'
        };
      });
    } catch (error) {
      console.error('Error al consolidar resumen:', error.message);
      throw new HttpException('Error al obtener datos consolidados', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async crearEquipo(datos: any, userEmail: string) {
    const url = 'http://localhost:3003/api/equipos';
    try {
      const { data } = await firstValueFrom(this.httpService.post(url, datos));
      await this.addLog('EQUIPO_CREATED', userEmail, `Equipo "${datos.nombre}" registrado`);
      return data;
    } catch (error) {
      console.error('Error al crear equipo:', error.message);
      await this.addLog('EQUIPO_CREATE_ERROR', userEmail, `Fallo al crear equipo "${datos.nombre}": ${error.message}`);
      throw new HttpException('Error al crear el equipo en el microservicio', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async obtenerLogs() {
    return this.logs;
  }
}
