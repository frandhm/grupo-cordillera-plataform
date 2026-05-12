import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'; // Imports de Swagger
import { AppService } from './app.service';
import { AuthGuard } from './auth.guard';
import { LoginDto } from './dto/login.dto';
import { CrearEquipoDto } from './dto/crear-equipo.dto';

@ApiTags('Plataforma Cordillera') // Agrupa todo bajo un nombre bonito
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post('auth/login')
  @ApiOperation({ summary: 'Iniciar sesión y obtener token JWT' })
  async login(@Body() credenciales: LoginDto) {
    return await this.appService.login(credenciales.usuario, credenciales.clave);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('dashboard/equipos')
  @ApiOperation({ summary: 'Crear un nuevo Equipo (Requiere Token)' })
  async crearEquipo(@Body() nuevoEquipo: CrearEquipoDto) {
    return await this.appService.crearEquipo(nuevoEquipo);
  }

  @ApiBearerAuth() // <--- Esto le dice a Swagger: "Esta ruta pide Token"
  @UseGuards(AuthGuard)
  @Get('dashboard/kpis')
  @ApiOperation({ summary: 'Obtener KPIs consolidados (Requiere Token)' })
  async getKpis() {
    return await this.appService.obtenerKpisDesdeMicroservicio();
  }

  @ApiBearerAuth() // Le decimos a Swagger que requiere Token
  @UseGuards(AuthGuard) // Protegemos la ruta
  @Get('dashboard/equipos')
  @ApiOperation({ summary: 'Obtener listado de Equipos (Requiere Token)' })
  async getEquipos() {
    return await this.appService.obtenerEquiposDesdeMicroservicio();
  }
}