import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './auth.guard'; // Importamos el guardia

@Controller('dashboard')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @UseGuards(AuthGuard) // <--- ¡AQUÍ ESTÁ EL CANDADO!
  @Get('kpis')
  async getKpis() {
    return await this.appService.obtenerKpisDesdeMicroservicio();
  }
}