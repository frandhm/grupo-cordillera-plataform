import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppService } from './app.service';
import { KpiEntity } from './kpi.entity';
import { MedicionEntity } from './medicion.entity';

describe('AppService - ms-kpis', () => {
  let service: AppService;
  let kpiRepository: jest.Mocked<Repository<KpiEntity>>;
  let medicionRepository: jest.Mocked<Repository<MedicionEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: getRepositoryToken(KpiEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(MedicionEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
    kpiRepository = module.get<jest.Mocked<Repository<KpiEntity>>>(
      getRepositoryToken(KpiEntity),
    );
    medicionRepository = module.get<jest.Mocked<Repository<MedicionEntity>>>(
      getRepositoryToken(MedicionEntity),
    );
  });

  describe('crearKpi', () => {
    it('debería crear un KPI con medición inicial', async () => {
      const kpiData = {
        nombre: 'Ventas Mensuales',
        valor: 50000,
        areaId: '1',
        descripcion: 'Total de ventas',
        unidadMedicion: 'CLP',
      };
      const kpiEntity = { id: '123', ...kpiData };
      const medicionEntity = { id: '1', valor: 50000, kpi: kpiEntity };

      kpiRepository.create.mockReturnValue(kpiEntity as any);
      kpiRepository.save.mockResolvedValue(kpiEntity as any);
      medicionRepository.create.mockReturnValue(medicionEntity as any);
      medicionRepository.save.mockResolvedValue(medicionEntity as any);

      const result = await service.crearKpi(kpiData);

      expect(result).toEqual(kpiEntity);
      expect(kpiRepository.create).toHaveBeenCalled();
      expect(kpiRepository.save).toHaveBeenCalled();
      expect(medicionRepository.create).toHaveBeenCalled();
      expect(medicionRepository.save).toHaveBeenCalled();
    });

    it('debería usar factory method para crear KPI', async () => {
      const kpiData = { nombre: 'Test KPI', valor: 100 };
      const kpiEntity = { id: '123', ...kpiData };
      const medicionEntity = { id: '1', valor: 100, kpi: kpiEntity };

      kpiRepository.create.mockReturnValue(kpiEntity as any);
      kpiRepository.save.mockResolvedValue(kpiEntity as any);
      medicionRepository.create.mockReturnValue(medicionEntity as any);
      medicionRepository.save.mockResolvedValue(medicionEntity as any);

      const result = await service.crearKpi(kpiData);

      expect(result.nombre).toBe('Test KPI');
    });
  });

  describe('obtenerTodos', () => {
    it('debería retornar todos los KPIs con mediciones', async () => {
      const kpis = [
        {
          id: '1',
          nombre: 'KPI A',
          valor: 100,
          mediciones: [{ id: '1', valor: 100 }],
        },
        {
          id: '2',
          nombre: 'KPI B',
          valor: 200,
          mediciones: [{ id: '2', valor: 200 }],
        },
      ];

      kpiRepository.find.mockResolvedValue(kpis as any);

      const result = await service.obtenerTodos();

      expect(result).toEqual(kpis);
      expect(kpiRepository.find).toHaveBeenCalledWith({ relations: ['mediciones'] });
    });

    it('debería retornar array vacío si no hay KPIs', async () => {
      kpiRepository.find.mockResolvedValue([]);

      const result = await service.obtenerTodos();

      expect(result).toEqual([]);
    });
  });

  describe('obtenerPorId', () => {
    it('debería retornar un KPI por su ID', async () => {
      const kpiId = '123e4567-e89b-12d3-a456-426614174000';
      const kpi = {
        id: kpiId,
        nombre: 'Ventas',
        valor: 50000,
        mediciones: [],
      };

      kpiRepository.findOne.mockResolvedValue(kpi as any);

      const result = await service.obtenerPorId(kpiId);

      expect(result).toEqual(kpi);
      expect(kpiRepository.findOne).toHaveBeenCalledWith({
        where: { id: kpiId },
        relations: ['mediciones'],
      });
    });

    it('debería lanzar NotFoundException si KPI no existe', async () => {
      const kpiId = '999';
      kpiRepository.findOne.mockResolvedValue(null);

      await expect(service.obtenerPorId(kpiId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('actualizarValor', () => {
    it('debería actualizar el valor del KPI y guardar medición', async () => {
      const kpiId = '123e4567-e89b-12d3-a456-426614174000';
      const kpi = {
        id: kpiId,
        nombre: 'Ventas',
        valor: 50000,
      };
      const nuevoValor = 60000;
      const kpiActualizado = { ...kpi, valor: nuevoValor };
      const medicion = { id: '2', valor: nuevoValor, kpi: kpiActualizado };

      kpiRepository.findOne.mockResolvedValue(kpi as any);
      kpiRepository.save.mockResolvedValue(kpiActualizado as any);
      medicionRepository.create.mockReturnValue(medicion as any);
      medicionRepository.save.mockResolvedValue(medicion as any);

      const result = await service.actualizarValor(kpiId, nuevoValor);

      expect(result.valor).toBe(nuevoValor);
      expect(kpiRepository.save).toHaveBeenCalled();
      expect(medicionRepository.save).toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si KPI no existe', async () => {
      const kpiId = '999';
      kpiRepository.findOne.mockResolvedValue(null);

      await expect(service.actualizarValor(kpiId, 100)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debería convertir a número el valor actualizado', async () => {
      const kpiId = '123';
      const kpi = { id: kpiId, nombre: 'Test', valor: 50 };
      const kpiActualizado = { ...kpi, valor: 75 };
      const medicion = { id: '1', valor: 75, kpi: kpiActualizado };

      kpiRepository.findOne.mockResolvedValue(kpi as any);
      kpiRepository.save.mockResolvedValue(kpiActualizado as any);
      medicionRepository.create.mockReturnValue(medicion as any);
      medicionRepository.save.mockResolvedValue(medicion as any);

      const result = await service.actualizarValor(kpiId, '75' as any);

      expect(result.valor).toBe(75);
      expect(typeof result.valor).toBe('number');
    });
  });

  describe('obtenerHistorial', () => {
    it('debería retornar mediciones ordenadas por fecha', async () => {
      const kpiId = '123';
      const mediciones = [
        { id: '1', valor: 100, fecha: '2024-01-01' },
        { id: '2', valor: 110, fecha: '2024-01-02' },
        { id: '3', valor: 120, fecha: '2024-01-03' },
      ];

      medicionRepository.find.mockResolvedValue(mediciones as any);

      const result = await service.obtenerHistorial(kpiId);

      expect(result).toEqual(mediciones);
      expect(medicionRepository.find).toHaveBeenCalledWith({
        where: { kpi: { id: kpiId } },
        order: { fecha: 'ASC' },
      });
    });

    it('debería retornar array vacío si no hay mediciones', async () => {
      const kpiId = '999';
      medicionRepository.find.mockResolvedValue([]);

      const result = await service.obtenerHistorial(kpiId);

      expect(result).toEqual([]);
    });
  });

  describe('eliminarKpi', () => {
    it('debería eliminar KPI y todas sus mediciones', async () => {
      const kpiId = '123e4567-e89b-12d3-a456-426614174000';
      const kpi = { id: kpiId, nombre: 'Ventas' };

      kpiRepository.findOne.mockResolvedValue(kpi as any);
      medicionRepository.delete.mockResolvedValue({ affected: 5 } as any);
      kpiRepository.remove.mockResolvedValue(kpi as any);

      const result = await service.eliminarKpi(kpiId);

      expect(result).toEqual({ mensaje: 'KPI y su historial eliminados' });
      expect(medicionRepository.delete).toHaveBeenCalledWith({
        kpi: { id: kpiId },
      });
      expect(kpiRepository.remove).toHaveBeenCalledWith(kpi);
    });

    it('debería lanzar NotFoundException si KPI no existe', async () => {
      const kpiId = '999';
      kpiRepository.findOne.mockResolvedValue(null);

      await expect(service.eliminarKpi(kpiId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});