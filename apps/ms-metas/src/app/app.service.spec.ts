import { Test } from '@nestjs/testing';
import { AppService } from './app.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MetaEntity } from './meta.entity';
import { KpiApiFacade } from './kpi-api.facade';

describe('AppService', () => {
  let service: AppService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  };

  const mockKpiFacade = {
    validarIndicador: jest.fn(),
    obtenerValorActual: jest.fn(),
  };

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: getRepositoryToken(MetaEntity),
          useValue: mockRepository,
        },
        {
          provide: KpiApiFacade,
          useValue: mockKpiFacade,
        },
      ],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});