import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const mockMeta = {
  id: 'uuid-001',
  nombre: 'Aumentar ventas A3',
  areaId: 'area-001',
  valorObjetivo: 100,
  valorActual: 40,
  estado: 'EN_PROGRESO',
  fechaLimite: '2026-12-31',
  fechaCreacion: new Date('05/09/2026'),
  porcentajeCumplimiento: '40.00%',
};

const mockAppService = {
  obtenerTodas: jest.fn(),
  obtenerPorId: jest.fn(),
  crearMeta: jest.fn(),
  actualizarMeta: jest.fn(),
  eliminarMeta: jest.fn(),
};

describe('AppController', () => {
  let controller: AppController;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: mockAppService }],
    }).compile();

    controller = app.get<AppController>(AppController);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── GET /metas ───────────────────────────────────────────────────────────

  describe('obtenerMetas', () => {
    it('debe retornar lista de metas', async () => {
      mockAppService.obtenerTodas.mockResolvedValue([mockMeta]);

      const result = await controller.obtenerMetas();

      expect(mockAppService.obtenerTodas).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('uuid-001');
    });

    it('debe retornar array vacío si no hay metas', async () => {
      mockAppService.obtenerTodas.mockResolvedValue([]);

      const result = await controller.obtenerMetas();

      expect(result).toEqual([]);
    });
  });

  // ─── GET /metas/:id ───────────────────────────────────────────────────────

  describe('obtenerMetaPorId', () => {
    it('debe retornar una meta por ID', async () => {
      mockAppService.obtenerPorId.mockResolvedValue(mockMeta);

      const result = await controller.obtenerMetaPorId('uuid-001');

      expect(mockAppService.obtenerPorId).toHaveBeenCalledWith('uuid-001');
      expect(result.id).toBe('uuid-001');
    });
  });

  // ─── POST /metas ──────────────────────────────────────────────────────────

  describe('crearMeta', () => {
    it('debe crear una nueva meta', async () => {
      const datos = { nombre: 'Nueva meta', areaId: 'area-1', valorObjetivo: 100, fechaLimite: '2026-12-31' };
      mockAppService.crearMeta.mockResolvedValue({ ...mockMeta, ...datos });

      const result = await controller.crearMeta(datos);

      expect(mockAppService.crearMeta).toHaveBeenCalledWith(datos);
      expect(result.nombre).toBe('Nueva meta');
    });
  });

  // ─── PUT /metas/:id ───────────────────────────────────────────────────────

  describe('actualizarMeta', () => {
    it('debe actualizar una meta existente', async () => {
      const datosActualizados = { valorActual: 100 };
      mockAppService.actualizarMeta.mockResolvedValue({ ...mockMeta, valorActual: 100, estado: 'CUMPLIDA' });

      const result = await controller.actualizarMeta('uuid-001', datosActualizados);

      expect(mockAppService.actualizarMeta).toHaveBeenCalledWith('uuid-001', datosActualizados);
      expect(result.estado).toBe('CUMPLIDA');
    });
  });

  // ─── DELETE /metas/:id ────────────────────────────────────────────────────

  describe('eliminarMeta', () => {
    it('debe eliminar una meta y retornar mensaje', async () => {
      mockAppService.eliminarMeta.mockResolvedValue({ mensaje: 'Meta uuid-001 eliminada correctamente' });

      const result = await controller.eliminarMeta('uuid-001');

      expect(mockAppService.eliminarMeta).toHaveBeenCalledWith('uuid-001');
      expect(result.mensaje).toContain('uuid-001');
    });
  });
});