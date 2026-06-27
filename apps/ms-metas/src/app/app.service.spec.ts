import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppService } from './app.service';
import { MetaEntity } from './meta.entity';
import { KpiApiFacade } from './kpi-api.facade';

describe('AppService - ms-metas', () => {
  let service: AppService;
  let metaRepository: jest.Mocked<Repository<MetaEntity>>;
  let kpiApiFacade: jest.Mocked<KpiApiFacade>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: getRepositoryToken(MetaEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: KpiApiFacade,
          useValue: {
            validarIndicador: jest.fn(),
            obtenerHistorial: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
    metaRepository = module.get<jest.Mocked<Repository<MetaEntity>>>(
      getRepositoryToken(MetaEntity),
    );
    kpiApiFacade = module.get<jest.Mocked<KpiApiFacade>>(KpiApiFacade);
  });

  describe('crearMeta', () => {
    it('debería crear una meta con validación de indicador', async () => {
      const metaData = {
        nombre: 'Aumentar ventas',
        valorObjetivo: 100000,
        operador: '>=',
        indicadorId: '123',
        fechaFin: '2024-12-31',
        fechaInicio: '2024-01-01',
      };
      const metaEntity = { id: '1', ...metaData, estado: 'EN_PROGRESO' };

      kpiApiFacade.validarIndicador.mockResolvedValue(null);
      metaRepository.save.mockResolvedValue(metaEntity as any);

      const result = await service.crearMeta(metaData);

      expect(result).toEqual(metaEntity);
      expect(kpiApiFacade.validarIndicador).toHaveBeenCalledWith(metaData.indicadorId);
      expect(metaRepository.save).toHaveBeenCalled();
    });

    it('debería crear meta sin indicador', async () => {
      const metaData = {
        nombre: 'Meta sin KPI',
        valorObjetivo: 50,
        operador: '>=',
        fechaFin: '2024-12-31',
        fechaInicio: '2024-01-01',
      };
      const metaEntity = { id: '1', ...metaData, estado: 'EN_PROGRESO' };

      metaRepository.save.mockResolvedValue(metaEntity as any);

      const result = await service.crearMeta(metaData);

      expect(result).toEqual(metaEntity);
      expect(kpiApiFacade.validarIndicador).not.toHaveBeenCalled();
    });

    it('debería usar operador >= por defecto', async () => {
      const metaData = {
        nombre: 'Test Meta',
        valorObjetivo: 100,
        fechaFin: '2024-12-31',
        fechaInicio: '2024-01-01',
      };
      const metaEntity = { id: '1', ...metaData, operador: '>=', estado: 'EN_PROGRESO' };

      metaRepository.save.mockResolvedValue(metaEntity as any);

      await service.crearMeta(metaData);

      expect(metaRepository.save).toHaveBeenCalled();
    });
  });

  describe('obtenerTodas', () => {
    it('debería retornar todas las metas enriquecidas', async () => {
      const metas = [
        {
          id: '1',
          nombre: 'Meta 1',
          indicadorId: '123',
          valorObjetivo: 100,
          operador: '>=',
          fechaInicio: '2024-01-01',
          fechaFin: '2024-12-31',
        },
      ];
      const mediciones = [
        { valor: 50, fecha: '2024-06-01' },
        { valor: 60, fecha: '2024-06-02' },
      ];

      metaRepository.find.mockResolvedValue(metas as any);
      kpiApiFacade.obtenerHistorial.mockResolvedValue(mediciones);

      const result = await service.obtenerTodas();

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(metaRepository.find).toHaveBeenCalled();
    });

    it('debería retornar metas sin error si falla enriquecimiento', async () => {
      const metas = [
        {
          id: '1',
          nombre: 'Meta sin KPI',
          indicadorId: null,
          valorObjetivo: 100,
          operador: '>=',
          fechaInicio: '2024-01-01',
          fechaFin: '2024-12-31',
        },
      ];

      metaRepository.find.mockResolvedValue(metas as any);

      const result = await service.obtenerTodas();

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
    });
  });

  describe('obtenerPorId', () => {
    it('debería retornar meta enriquecida por ID', async () => {
      const metaId = '123e4567-e89b-12d3-a456-426614174000';
      const meta = {
        id: metaId,
        nombre: 'Meta Importante',
        indicadorId: '456',
        valorObjetivo: 100,
        operador: '>=',
        fechaInicio: '2024-01-01',
        fechaFin: '2024-12-31',
      };
      const mediciones = [{ valor: 80, fecha: '2024-06-01' }];

      metaRepository.findOne.mockResolvedValue(meta as any);
      kpiApiFacade.obtenerHistorial.mockResolvedValue(mediciones);

      const result = await service.obtenerPorId(metaId);

      expect(result).toBeDefined();
      expect(result.id).toBe(metaId);
      expect(metaRepository.findOne).toHaveBeenCalledWith({ where: { id: metaId } });
    });

    it('debería lanzar NotFoundException si meta no existe', async () => {
      const metaId = '999';
      metaRepository.findOne.mockResolvedValue(null);

      await expect(service.obtenerPorId(metaId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('actualizarMeta', () => {
    it('debería actualizar meta validando nuevo indicador', async () => {
      const metaId = '123';
      const metaAnterior = {
        id: metaId,
        nombre: 'Meta Antigua',
        indicadorId: '456',
        valorObjetivo: 100,
        operador: '>=',
        fechaInicio: '2024-01-01',
        fechaFin: '2024-12-31',
      };
      const actualizacion = { nombre: 'Meta Nueva', indicadorId: '789' };
      const metaActualizada = { ...metaAnterior, ...actualizacion };

      metaRepository.findOne.mockResolvedValue(metaAnterior as any);
      kpiApiFacade.validarIndicador.mockResolvedValue(null);
      metaRepository.save.mockResolvedValue(metaActualizada as any);

      const result = await service.actualizarMeta(metaId, actualizacion);

      expect(result).toEqual(metaActualizada);
      expect(kpiApiFacade.validarIndicador).toHaveBeenCalledWith('789');
      expect(metaRepository.save).toHaveBeenCalled();
    });

    it('no debería validar indicador si no cambia', async () => {
      const metaId = '123';
      const meta = {
        id: metaId,
        nombre: 'Meta',
        indicadorId: '456',
        valorObjetivo: 100,
        operador: '>=',
        fechaInicio: '2024-01-01',
        fechaFin: '2024-12-31',
      };
      const actualizacion = { nombre: 'Meta Actualizada' };
      const metaActualizada = { ...meta, ...actualizacion };

      metaRepository.findOne.mockResolvedValue(meta as any);
      metaRepository.save.mockResolvedValue(metaActualizada as any);

      const result = await service.actualizarMeta(metaId, actualizacion);

      expect(result).toEqual(metaActualizada);
      expect(kpiApiFacade.validarIndicador).not.toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si meta no existe', async () => {
      const metaId = '999';
      metaRepository.findOne.mockResolvedValue(null);

      await expect(
        service.actualizarMeta(metaId, { nombre: 'Nueva' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('eliminarMeta', () => {
    it('debería eliminar meta correctamente', async () => {
      const metaId = '123e4567-e89b-12d3-a456-426614174000';
      const meta = { id: metaId, nombre: 'Meta a Eliminar' };

      metaRepository.findOne.mockResolvedValue(meta as any);
      metaRepository.remove.mockResolvedValue(meta as any);

      const result = await service.eliminarMeta(metaId);

      expect(result).toEqual({ mensaje: `Meta ${metaId} eliminada correctamente` });
      expect(metaRepository.findOne).toHaveBeenCalledWith({ where: { id: metaId } });
      expect(metaRepository.remove).toHaveBeenCalledWith(meta);
    });

    it('debería lanzar NotFoundException si meta no existe', async () => {
      const metaId = '999';
      metaRepository.findOne.mockResolvedValue(null);

      await expect(service.eliminarMeta(metaId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('Cálculos privados', () => {
    it('debería calcular tasa de cumplimiento con operador >=', async () => {
      const meta = {
        id: '1',
        nombre: 'Meta',
        indicadorId: '123',
        valorObjetivo: 100,
        operador: '>=',
        fechaInicio: '2024-01-01',
        fechaFin: '2024-12-31',
      };
      const mediciones = [
        { valor: 80, fecha: '2024-06-01' },
        { valor: 120, fecha: '2024-06-02' },
      ];

      metaRepository.findOne.mockResolvedValue(meta as any);
      kpiApiFacade.obtenerHistorial.mockResolvedValue(mediciones);

      const result = await service.obtenerPorId('1');

      expect(result.tasaCumplimiento).toBeDefined();
      expect(result.valorPromedio).toBe(100);
    });

    it('debería marcar meta como EXCELENTE si cumplimiento >= 100%', async () => {
      const meta = {
        id: '1',
        nombre: 'Meta',
        indicadorId: '123',
        valorObjetivo: 100,
        operador: '>=',
        fechaInicio: '2024-01-01',
        fechaFin: '2099-12-31', // Futuro para que no esté vencida
      };
      const mediciones = [
        { valor: 120, fecha: '2024-06-01' },
        { valor: 130, fecha: '2024-06-02' },
      ];

      metaRepository.findOne.mockResolvedValue(meta as any);
      kpiApiFacade.obtenerHistorial.mockResolvedValue(mediciones);

      const result = await service.obtenerPorId('1');

      expect(result.estado).toBe('EXCELENTE');
    });

    it('debería marcar meta como NO_CUMPLIDA si está vencida', async () => {
      const meta = {
        id: '1',
        nombre: 'Meta Vencida',
        indicadorId: '123',
        valorObjetivo: 100,
        operador: '>=',
        fechaInicio: '2020-01-01',
        fechaFin: '2020-12-31', // Pasado
      };
      const mediciones = [{ valor: 30, fecha: '2020-06-01' }];

      metaRepository.findOne.mockResolvedValue(meta as any);
      kpiApiFacade.obtenerHistorial.mockResolvedValue(mediciones);

      const result = await service.obtenerPorId('1');

      expect(result.estado).toBe('NO_CUMPLIDA');
    });
  });
});