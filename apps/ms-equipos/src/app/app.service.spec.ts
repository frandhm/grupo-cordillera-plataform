import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppService } from './app.service';
import { EquipoEntity } from './equipo.entity';
import { AreaEntity } from './area.entity';

describe('AppService - ms-equipos', () => {
  let service: AppService;
  let equipoRepository: jest.Mocked<Repository<EquipoEntity>>;
  let areaRepository: jest.Mocked<Repository<AreaEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: getRepositoryToken(EquipoEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AreaEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
    equipoRepository = module.get<jest.Mocked<Repository<EquipoEntity>>>(
      getRepositoryToken(EquipoEntity),
    );
    areaRepository = module.get<jest.Mocked<Repository<AreaEntity>>>(
      getRepositoryToken(AreaEntity),
    );
  });

  describe('crear', () => {
    it('debería crear un equipo con área existente', async () => {
      const areaId = '123e4567-e89b-12d3-a456-426614174000';
      const equipoData = { nombre: 'Equipo A', areaId };
      const areaEntity = { id: areaId, nombre: 'Ventas' };
      const equipoEntity = { id: '999', ...equipoData, area: areaEntity };

      areaRepository.findOne.mockResolvedValue(areaEntity as any);
      equipoRepository.create.mockReturnValue(equipoEntity as any);
      equipoRepository.save.mockResolvedValue(equipoEntity as any);

      const result = await service.crear(equipoData);

      expect(result).toEqual(equipoEntity);
      expect(equipoRepository.create).toHaveBeenCalled();
      expect(equipoRepository.save).toHaveBeenCalled();
    });

    it('debería crear área si no existe', async () => {
      const equipoData = { nombre: 'Equipo B', areaId: 'NuevaArea' };
      const newArea = { id: '888', nombre: 'NuevaArea' };
      const equipoEntity = { id: '999', ...equipoData, area: newArea };

      areaRepository.findOne.mockResolvedValue(null);
      areaRepository.create.mockReturnValue(newArea as any);
      areaRepository.save.mockResolvedValue(newArea as any);
      equipoRepository.create.mockReturnValue(equipoEntity as any);
      equipoRepository.save.mockResolvedValue(equipoEntity as any);

      const result = await service.crear(equipoData);

      expect(result).toEqual(equipoEntity);
      expect(areaRepository.create).toHaveBeenCalled();
      expect(areaRepository.save).toHaveBeenCalled();
    });

    it('debería crear equipo sin área si no se proporciona', async () => {
      const equipoData = { nombre: 'Equipo Sin Área' };
      const equipoEntity = { id: '999', ...equipoData };

      equipoRepository.create.mockReturnValue(equipoEntity as any);
      equipoRepository.save.mockResolvedValue(equipoEntity as any);

      const result = await service.crear(equipoData);

      expect(result).toEqual(equipoEntity);
      expect(areaRepository.findOne).not.toHaveBeenCalled();
    });
  });

  describe('obtenerTodos', () => {
    it('debería retornar todos los equipos con relaciones', async () => {
      const equipos = [
        { id: '1', nombre: 'Equipo A', area: { id: '1', nombre: 'Ventas' } },
        { id: '2', nombre: 'Equipo B', area: { id: '2', nombre: 'Soporte' } },
      ];

      equipoRepository.find.mockResolvedValue(equipos as any);

      const result = await service.obtenerTodos();

      expect(result).toEqual(equipos);
      expect(equipoRepository.find).toHaveBeenCalledWith({ relations: ['area'] });
    });

    it('debería retornar array vacío si no hay equipos', async () => {
      equipoRepository.find.mockResolvedValue([]);

      const result = await service.obtenerTodos();

      expect(result).toEqual([]);
    });
  });

  describe('obtenerPorId', () => {
    it('debería retornar un equipo por su ID', async () => {
      const equipoId = '123e4567-e89b-12d3-a456-426614174000';
      const equipo = {
        id: equipoId,
        nombre: 'Equipo A',
        area: { id: '1', nombre: 'Ventas' },
      };

      equipoRepository.findOne.mockResolvedValue(equipo as any);

      const result = await service.obtenerPorId(equipoId);

      expect(result).toEqual(equipo);
      expect(equipoRepository.findOne).toHaveBeenCalledWith({
        where: { id: equipoId },
        relations: ['area'],
      });
    });

    it('debería lanzar NotFoundException si equipo no existe', async () => {
      const equipoId = '999';
      equipoRepository.findOne.mockResolvedValue(null);

      await expect(service.obtenerPorId(equipoId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('eliminar', () => {
    it('debería eliminar un equipo correctamente', async () => {
      const equipoId = '123e4567-e89b-12d3-a456-426614174000';
      const equipo = { id: equipoId, nombre: 'Equipo A' };

      equipoRepository.findOne.mockResolvedValue(equipo as any);
      equipoRepository.remove.mockResolvedValue(equipo as any);

      const result = await service.eliminar(equipoId);

      expect(result).toEqual({ mensaje: `Equipo ${equipoId} eliminado correctamente` });
      expect(equipoRepository.findOne).toHaveBeenCalledWith({ where: { id: equipoId } });
      expect(equipoRepository.remove).toHaveBeenCalledWith(equipo);
    });

    it('debería lanzar NotFoundException si equipo no existe', async () => {
      const equipoId = '999';
      equipoRepository.findOne.mockResolvedValue(null);

      await expect(service.eliminar(equipoId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('obtenerAreas', () => {
    it('debería retornar todas las áreas', async () => {
      const areas = [
        { id: '1', nombre: 'Ventas' },
        { id: '2', nombre: 'Soporte' },
      ];

      areaRepository.find.mockResolvedValue(areas as any);

      const result = await service.obtenerAreas();

      expect(result).toEqual(areas);
      expect(areaRepository.find).toHaveBeenCalled();
    });
  });

  describe('crearArea', () => {
    it('debería crear una nueva área', async () => {
      const nombreArea = 'Marketing';
      const areaEntity = { id: '555', nombre: nombreArea };

      areaRepository.create.mockReturnValue(areaEntity as any);
      areaRepository.save.mockResolvedValue(areaEntity as any);

      const result = await service.crearArea(nombreArea);

      expect(result).toEqual(areaEntity);
      expect(areaRepository.create).toHaveBeenCalledWith({ nombre: nombreArea });
      expect(areaRepository.save).toHaveBeenCalledWith(areaEntity);
    });
  });
});