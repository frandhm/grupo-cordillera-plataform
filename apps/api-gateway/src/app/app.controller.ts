import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AppService } from './app.service';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { LoginDto } from './dto/login.dto';
import { CrearEquipoDto } from './dto/crear-equipo.dto';

@ApiTags('Plataforma Cordillera')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post('auth/login')
  @ApiOperation({ summary: 'Iniciar sesión y obtener token JWT' })
  async login(@Body() credenciales: LoginDto) {
    return await this.appService.login(credenciales.usuario, credenciales.clave);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Post('dashboard/equipos')
  @Roles('jefe')
  @ApiOperation({ summary: 'Crear un nuevo Equipo (Solo Jefe)' })
  async crearEquipo(@Body() nuevoEquipo: CrearEquipoDto, @Req() req: any) {
    return await this.appService.crearEquipo(nuevoEquipo, req.user.email);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Post('dashboard/kpis')
  @Roles('jefe', 'gerente')
  @ApiOperation({ summary: 'Crear un nuevo KPI con validación de equipo' })
  async crearKpi(@Body() datos: any, @Req() req: any) {
    return await this.appService.crearKpi(datos, req.user.email);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Get('dashboard/kpis')
  @Roles('jefe', 'gerente', 'vendedor')
  @ApiOperation({ summary: 'Obtener KPIs consolidados' })
  async getKpis() {
    return await this.appService.obtenerKpisDesdeMicroservicio();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Get('dashboard/equipos')
  @Roles('jefe', 'gerente')
  @ApiOperation({ summary: 'Obtener listado de Equipos (Jefe y Gerente)' })
  async getEquipos() {
    return await this.appService.obtenerEquiposDesdeMicroservicio();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Get('dashboard/resumen')
  @Roles('jefe', 'gerente')
  @ApiOperation({ summary: 'Obtener resumen consolidado de KPIs y Metas (BFF)' })
  async getResumen() {
    return await this.appService.obtenerResumenConsolidado();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Get('dashboard/logs')
  @Roles('jefe')
  @ApiOperation({ summary: 'Obtener logs de auditoría (Solo Jefe)' })
  async getLogs() {
    return await this.appService.obtenerLogs();
  }
}