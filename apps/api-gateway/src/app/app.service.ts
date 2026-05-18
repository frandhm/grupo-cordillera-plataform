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
    { id: 1, event: 'LOGIN_SUCCESS', user: 'admin@cordillera.com', detail: 'Inicio de sesión exitoso', timestamp: new Date(Date.now() - 1000*60*60).toISOString() },
  ];

  async addLog(event: string, user: string, detail: string) {
    const newLog = {
      id: this.logs.length + 1,
      event,
      user,
      detail,
      timestamp: new Date().toISOString()
    };
    this.logs.unshift(newLog); // Agregar al principio
  }

  async login(usuario: string, clave: string) {
    let role = '';
    // JEFE (Acceso total)
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

    // 1. Validar que el equipo existe (si se proporcionó un equipoId)
    if (datos.equipoId) {
      try {
        const { data: equipos } = await firstValueFrom(this.httpService.get(urlEquipos));
        // ms-equipos usa id numérico o string? Según api.ts es id: number.
        // Pero el usuario ingresa un ID manual. Vamos a buscarlo.
        const equipoExiste = equipos.some(e => e.id.toString() === datos.equipoId.toString() || e.nombre === datos.equipoId);
        
        if (!equipoExiste) {
           await this.addLog('KPI_CREATE_ERROR', userEmail, `Intento de crear KPI con equipo inexistente: ${datos.equipoId}`);
           throw new HttpException(`El equipo con ID "${datos.equipoId}" no existe.`, HttpStatus.BAD_REQUEST);
        }
      } catch (e) {
        if (e instanceof HttpException) throw e;
        console.error('Error validando equipo:', e.message);
        // Si ms-equipos no responde, permitimos pasar pero con advertencia en logs
        await this.addLog('SYSTEM_WARNING', 'System', 'ms-equipos no disponible para validación');
      }
    }

    // 2. Crear el KPI
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