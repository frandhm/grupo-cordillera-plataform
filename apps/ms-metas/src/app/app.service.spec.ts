import { Test } from '@nestjs/testing';
import { AppService } from './app.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MetaEntity } from './meta.entity';
import { NotFoundException } from '@nestjs/common';

const mockMeta: MetaEntity = {
  id: 'uuid-001',
  nombre: 'Aumentar ventas Q3',
  areaId: 'area-001',
  valorObjetivo: 100,
  valorActual: 40,
  estado: 'EN_PROGRESO',
  fechaLimite: '2026-12-31',
  fechaCreacion: new Date('05/09/2026'),
};

const mockRepository = {
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
};

describe('AppService', () => {
  let service: AppService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: getRepositoryToken(MetaEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── crearMeta ────────────────────────────────────────────────────────────

  describe('crearMeta', () => {
    it('debe crear una meta con estado EN_PROGRESO cuando no alcanza el objetivo', async () => {
      const datos = { nombre: 'Meta test', areaId: 'area-1', valorObjetivo: 100, valorActual: 40, fechaLimite: '2026-12-31' };
      mockRepository.save.mockResolvedValue({ ...mockMeta, ...datos });

      const result = await service.crearMeta(datos);

      expect(mockRepository.save).toHaveBeenCalledTimes(1);
      expect(result.estado).toBe('EN_PROGRESO');
    });

    it('debe crear una meta con estado CUMPLIDA cuando valorActual >= valorObjetivo', async () => {
      const datos = { nombre: 'Meta cumplida', areaId: 'area-1', valorObjetivo: 100, valorActual: 100, fechaLimite: '2026-12-31' };
      mockRepository.save.mockResolvedValue({ ...mockMeta, ...datos, estado: 'CUMPLIDA' });

      const result = await service.crearMeta(datos);

      expect(result.estado).toBe('CUMPLIDA');
    });

    it('debe crear una meta con estado NO_CUMPLIDA cuando la fecha ya pasó y no se cumplió', async () => {
      const datos = { nombre: 'Meta vencida', areaId: 'area-1', valorObjetivo: 100, valorActual: 10, fechaLimite: '2020-01-01' };
      mockRepository.save.mockResolvedValue({ ...mockMeta, ...datos, estado: 'NO_CUMPLIDA' });

      const result = await service.crearMeta(datos);

      expect(result.estado).toBe('NO_CUMPLIDA');
    });

    it('debe usar valorActual = 0 si no se envía', async () => {
      const datos = { nombre: 'Sin valor actual', areaId: 'area-1', valorObjetivo: 100, fechaLimite: '2026-12-31' };
      mockRepository.save.mockResolvedValue({ ...mockMeta, ...datos, valorActual: 0 });

      await service.crearMeta(datos);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ estado: 'EN_PROGRESO' }),
      );
    });
  });

  // ─── obtenerTodas ─────────────────────────────────────────────────────────

  describe('obtenerTodas', () => {
    it('debe retornar todas las metas con porcentajeCumplimiento', async () => {
      mockRepository.find.mockResolvedValue([mockMeta]);

      const result = await service.obtenerTodas();

      expect(result).toHaveLength(1);
      expect(result[0].porcentajeCumplimiento).toBe('40.00%');
      expect(result[0].estado).toBe('EN_PROGRESO');
    });

    it('debe retornar array vacío si no hay metas', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.obtenerTodas();

      expect(result).toEqual([]);
    });

    it('debe mostrar CUMPLIDA cuando valorActual >= valorObjetivo', async () => {
      mockRepository.find.mockResolvedValue([{ ...mockMeta, valorActual: 100 }]);

      const result = await service.obtenerTodas();

      expect(result[0].porcentajeCumplimiento).toBe('100.00%');
      expect(result[0].estado).toBe('CUMPLIDA');
    });
  });

  // ─── obtenerPorId ─────────────────────────────────────────────────────────

  describe('obtenerPorId', () => {
    it('debe retornar la meta con porcentajeCumplimiento si existe', async () => {
      mockRepository.findOne.mockResolvedValue(mockMeta);

      const result = await service.obtenerPorId('uuid-001');

      expect(result.id).toBe('uuid-001');
      expect(result.porcentajeCumplimiento).toBe('40.00%');
    });

    it('debe lanzar NotFoundException si la meta no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.obtenerPorId('id-inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── actualizarMeta ───────────────────────────────────────────────────────

  describe('actualizarMeta', () => {
    it('debe actualizar y recalcular el estado correctamente', async () => {
      mockRepository.findOne.mockResolvedValue({ ...mockMeta });
      mockRepository.save.mockResolvedValue({ ...mockMeta, valorActual: 100, estado: 'CUMPLIDA' });

      const result = await service.actualizarMeta('uuid-001', { valorActual: 100 });

      expect(mockRepository.save).toHaveBeenCalledTimes(1);
      expect(result.estado).toBe('CUMPLIDA');
    });

    it('debe lanzar NotFoundException si la meta no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.actualizarMeta('id-inexistente', { valorActual: 50 })).rejects.toThrow(NotFoundException);
    });
  });

  // ─── eliminarMeta ─────────────────────────────────────────────────────────

  describe('eliminarMeta', () => {
    it('debe eliminar la meta y retornar mensaje de confirmación', async () => {
      mockRepository.findOne.mockResolvedValue(mockMeta);
      mockRepository.remove.mockResolvedValue(mockMeta);

      const result = await service.eliminarMeta('uuid-001');

      expect(mockRepository.remove).toHaveBeenCalledWith(mockMeta);
      expect(result.mensaje).toContain('uuid-001');
    });

    it('debe lanzar NotFoundException si la meta no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.eliminarMeta('id-inexistente')).rejects.toThrow(NotFoundException);
    });
  });
});