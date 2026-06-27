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
            crear: jest.fn(),
            obtenerTodos: jest.fn(),
            obtenerAreas: jest.fn(),
            obtenerPorId: jest.fn(),
            crearArea: jest.fn(),
            eliminar: jest.fn(),
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
