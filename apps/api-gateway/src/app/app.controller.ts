import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'; // Imports de Swagger
import { AppService } from './app.service';
import { AuthGuard } from './auth.guard';
import { LoginDto } from './dto/login.dto';

@ApiTags('Plataforma Cordillera') // Agrupa todo bajo un nombre bonito
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post('auth/login')
  @ApiOperation({ summary: 'Iniciar sesión y obtener token JWT' })
  async login(@Body() credenciales: LoginDto) {
    return await this.appService.login(credenciales.usuario, credenciales.clave);
  }

  @ApiBearerAuth() // <--- Esto le dice a Swagger: "Esta ruta pide Token"
  @UseGuards(AuthGuard)
  @Get('dashboard/kpis')
  @ApiOperation({ summary: 'Obtener KPIs consolidados (Requiere Token)' })
  async getKpis() {
    return await this.appService.obtenerKpisDesdeMicroservicio();
  }
}