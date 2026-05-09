import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('dashboard') // Cambiamos el nombre para que sea más claro
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('kpis')
  async getKpis() {
    // Cuando alguien llame a localhost:3000/api/dashboard/kpis
    // el Gateway irá a buscar los datos al microservicio (3001)
    return await this.appService.obtenerKpisDesdeMicroservicio();
  }
}