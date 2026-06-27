import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { of, throwError } from 'rxjs';
import { AppService } from './app.service';

describe('AppService - api-gateway', () => {
  let service: AppService;
  let httpService: jest.Mocked<HttpService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
    httpService = module.get<jest.Mocked<HttpService>>(HttpService);
    jwtService = module.get<jest.Mocked<JwtService>>(JwtService);
  });

  describe('login', () => {
    it('debería autenticar como jefe', async () => {
      const token = 'fake-jwt-token';
      jwtService.signAsync.mockResolvedValue(token);

      const result = await service.login('admin@cordillera.com', '123456');

      expect(result.access_token).toBe(token);
      expect(result.mensaje).toContain('jefe');
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        email: 'admin@cordillera.com',
        role: 'jefe',
      });
    });

    it('debería autenticar como gerente', async () => {
      const token = 'fake-jwt-token';
      jwtService.signAsync.mockResolvedValue(token);

      const result = await service.login('gerente@cordillera.com', '123456');

      expect(result.access_token).toBe(token);
      expect(result.mensaje).toContain('gerente');
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        email: 'gerente@cordillera.com',
        role: 'gerente',
      });
    });

    it('debería autenticar como vendedor', async () => {
      const token = 'fake-jwt-token';
      jwtService.signAsync.mockResolvedValue(token);

      const result = await service.login('vendedor@cordillera.com', '123456');

      expect(result.access_token).toBe(token);
      expect(result.mensaje).toContain('vendedor');
    });

    it('debería lanzar UnauthorizedException con credenciales inválidas', async () => {
      await expect(
        service.login('admin@cordillera.com', 'contraseña-incorrecta'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debería lanzar UnauthorizedException con usuario no registrado', async () => {
      await expect(
        service.login('usuario@desconocido.com', '123456'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debería registrar login exitoso en logs', async () => {
      jwtService.signAsync.mockResolvedValue('token');

      await service.login('admin@cordillera.com', '123456');

      const logs = await service.obtenerLogs();
      const loginLog = logs.find((log) => log.event === 'LOGIN_SUCCESS');
      expect(loginLog).toBeDefined();
      expect(loginLog.user).toBe('admin@cordillera.com');
    });

    it('debería registrar login fallido en logs', async () => {
      try {
        await service.login('admin@cordillera.com', 'password-bad');
      } catch (e) {
        // Error esperado
      }

      const logs = await service.obtenerLogs();
      const failureLog = logs.find((log) => log.event === 'LOGIN_FAILURE');
      expect(failureLog).toBeDefined();
    });
  });

  describe('addLog', () => {
    it('debería agregar un log correctamente', async () => {
      const logsBefore = (await service.obtenerLogs()).length;

      await service.addLog('TEST_EVENT', 'test@user.com', 'Evento de prueba');

      const logsAfter = (await service.obtenerLogs()).length;
      expect(logsAfter).toBe(logsBefore + 1);

      const newLog = (await service.obtenerLogs())[0];
      expect(newLog.event).toBe('TEST_EVENT');
      expect(newLog.user).toBe('test@user.com');
      expect(newLog.detail).toBe('Evento de prueba');
    });

    it('debería generar timestamp automáticamente', async () => {
      await service.addLog('TEST', 'user', 'detail');

      const logs = await service.obtenerLogs();
      const lastLog = logs[0];
      expect(lastLog.timestamp).toBeDefined();
      expect(new Date(lastLog.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('obtenerKpisDesdeMicroservicio', () => {
    it('debería retornar KPIs del microservicio', async () => {
      const kpis = [
        { id: '1', nombre: 'Ventas', valor: 50000 },
        { id: '2', nombre: 'Gastos', valor: 20000 },
      ];

      httpService.get.mockReturnValue(of({ data: kpis } as any));

      const result = await service.obtenerKpisDesdeMicroservicio();

      expect(result).toEqual(kpis);
      expect(httpService.get).toHaveBeenCalledWith('http://localhost:3001/api/kpis');
    });

    it('debería lanzar excepción si servicio no está disponible', async () => {
      httpService.get.mockReturnValue(
        throwError(() => new Error('Connection refused')),
      );

      await expect(service.obtenerKpisDesdeMicroservicio()).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('crearKpi', () => {
    it('debería crear KPI validando equipo', async () => {
      const kpiData = {
        nombre: 'Nuevo KPI',
        valor: 1000,
        equipoId: '123e4567-e89b-12d3-a456-426614174000',
      };
      const equipos = [{ id: '123e4567-e89b-12d3-a456-426614174000', nombre: 'Equipo A' }];
      const kpiCreado = { id: '999', ...kpiData };

      httpService.get.mockReturnValue(of({ data: equipos } as any));
      httpService.post.mockReturnValue(of({ data: kpiCreado } as any));

      const result = await service.crearKpi(kpiData, 'user@test.com');

      expect(result).toEqual(kpiCreado);
      expect(httpService.post).toHaveBeenCalledWith(
        'http://localhost:3001/api/kpis',
        kpiData,
      );
    });

    it('debería crear KPI sin validar equipo si no se proporciona', async () => {
      const kpiData = { nombre: 'KPI sin Equipo', valor: 1000 };
      const kpiCreado = { id: '999', ...kpiData };

      httpService.post.mockReturnValue(of({ data: kpiCreado } as any));

      const result = await service.crearKpi(kpiData, 'user@test.com');

      expect(result).toEqual(kpiCreado);
      expect(httpService.get).not.toHaveBeenCalled();
    });

    it('debería lanzar excepción si equipo no existe', async () => {
      const kpiData = {
        nombre: 'KPI',
        valor: 1000,
        equipoId: 'equipo-inexistente',
      };
      const equipos = [{ id: '123', nombre: 'Equipo A' }];

      httpService.get.mockReturnValue(of({ data: equipos } as any));

      await expect(
        service.crearKpi(kpiData, 'user@test.com'),
      ).rejects.toThrow(HttpException);
    });

    it('debería registrar KPI_CREATED en logs', async () => {
      const kpiData = { nombre: 'Test KPI', valor: 100 };
      const kpiCreado = { id: '999', ...kpiData };

      httpService.post.mockReturnValue(of({ data: kpiCreado } as any));

      await service.crearKpi(kpiData, 'admin@cordillera.com');

      const logs = await service.obtenerLogs();
      const createLog = logs.find((log) => log.event === 'KPI_CREATED');
      expect(createLog).toBeDefined();
      expect(createLog.detail).toContain('Test KPI');
    });
  });

  describe('obtenerEquiposDesdeMicroservicio', () => {
    it('debería retornar equipos del microservicio', async () => {
      const equipos = [
        { id: '1', nombre: 'Ventas' },
        { id: '2', nombre: 'Soporte' },
      ];

      httpService.get.mockReturnValue(of({ data: equipos } as any));

      const result = await service.obtenerEquiposDesdeMicroservicio();

      expect(result).toEqual(equipos);
      expect(httpService.get).toHaveBeenCalledWith('http://localhost:3003/api/equipos');
    });

    it('debería retornar array vacío si falla conexión', async () => {
      httpService.get.mockReturnValue(
        throwError(() => new Error('Connection error')),
      );

      const result = await service.obtenerEquiposDesdeMicroservicio();

      expect(result).toEqual([]);
    });
  });

  describe('crearEquipo', () => {
    it('debería crear equipo y registrar en logs', async () => {
      const equipoData = { nombre: 'Nuevo Equipo', areaId: '1' };
      const equipoCreado = { id: '999', ...equipoData };

      httpService.post.mockReturnValue(of({ data: equipoCreado } as any));

      const result = await service.crearEquipo(equipoData, 'user@test.com');

      expect(result).toEqual(equipoCreado);
      expect(httpService.post).toHaveBeenCalledWith(
        'http://localhost:3003/api/equipos',
        equipoData,
      );
    });

    it('debería registrar EQUIPO_CREATED en logs', async () => {
      const equipoData = { nombre: 'Mi Equipo' };
      const equipoCreado = { id: '999', ...equipoData };

      httpService.post.mockReturnValue(of({ data: equipoCreado } as any));

      await service.crearEquipo(equipoData, 'admin@cordillera.com');

      const logs = await service.obtenerLogs();
      const createLog = logs.find((log) => log.event === 'EQUIPO_CREATED');
      expect(createLog).toBeDefined();
      expect(createLog.detail).toContain('Mi Equipo');
    });

    it('debería registrar error si falla creación', async () => {
      const equipoData = { nombre: 'Equipo' };

      httpService.post.mockReturnValue(
        throwError(() => new Error('Server error')),
      );

      await expect(
        service.crearEquipo(equipoData, 'user@test.com'),
      ).rejects.toThrow(HttpException);

      const logs = await service.obtenerLogs();
      const errorLog = logs.find((log) => log.event === 'EQUIPO_CREATE_ERROR');
      expect(errorLog).toBeDefined();
    });
  });

  describe('obtenerResumenConsolidado', () => {
    it('debería combinar KPIs con Metas', async () => {
      const kpis = [
        { id: '1', nombre: 'KPI A', valor: 100 },
        { id: '2', nombre: 'KPI B', valor: 200 },
      ];
      const metas = [
        {
          id: 'm1',
          indicadorId: '1',
          tasaCumplimiento: 120.5,
          estado: 'EXCELENTE',
        },
      ];

      httpService.get
        .mockReturnValueOnce(of({ data: kpis } as any))
        .mockReturnValueOnce(of({ data: metas } as any));

      const result = await service.obtenerResumenConsolidado();

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0]).toHaveProperty('cumplimientoCalculado');
      expect(result[0].meta).toBeDefined();
      expect(result[1].meta).toBeNull();
    });

    it('debería mostrar 0% cumplimiento si no hay meta', async () => {
      const kpis = [{ id: '1', nombre: 'KPI Solo', valor: 100 }];
      const metas = [];

      httpService.get
        .mockReturnValueOnce(of({ data: kpis } as any))
        .mockReturnValueOnce(of({ data: metas } as any));

      const result = await service.obtenerResumenConsolidado();

      expect(result[0].cumplimientoCalculado).toBe('0%');
    });

    it('debería lanzar excepción si falla consolidación', async () => {
      httpService.get.mockReturnValue(
        throwError(() => new Error('Service unavailable')),
      );

      await expect(service.obtenerResumenConsolidado()).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('obtenerLogs', () => {
    it('debería retornar todos los logs', async () => {
      const logs = await service.obtenerLogs();

      expect(Array.isArray(logs)).toBe(true);
      expect(logs.length).toBeGreaterThan(0);
    });

    it('debería incluir log inicial', async () => {
      const logs = await service.obtenerLogs();
      const initialLog = logs.find(
        (log) => log.user === 'admin@cordillera.com' && log.event === 'LOGIN_SUCCESS',
      );

      expect(initialLog).toBeDefined();
    });
  });
});