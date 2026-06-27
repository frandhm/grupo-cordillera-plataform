import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            obtenerKpis: jest.fn(),
            obtenerPorId: jest.fn(),
            crearNuevoKpi: jest.fn(),
            actualizarKpi: jest.fn(),
            obtenerHistorial: jest.fn(),
            eliminarKpi: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });
});
