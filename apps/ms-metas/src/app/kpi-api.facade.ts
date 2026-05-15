import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class KpiApiFacade {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const host = this.configService.get<string>('DB_KPIS_HOST') || 'localhost';
    // Nota: Usamos el puerto 3001 que es donde corre el MS-KPIs
    this.baseUrl = `http://${host}:3001/api/kpis`;
  }

  async validarIndicador(indicadorId: string): Promise<boolean> {
    try {
      await firstValueFrom(this.httpService.get(`${this.baseUrl}/${indicadorId}`));
      return true;
    } catch (error) {
      console.error(`Error de conexión con MS-KPIs en ${this.baseUrl}/${indicadorId}:`, error.message);
      if (error.response?.status === 404) {
        throw new NotFoundException(`El indicador con ID ${indicadorId} no existe en el sistema de KPIs`);
      }
      throw new InternalServerErrorException(`Error de conexión con MS-KPIs: ${error.message}`);
    }
  }

  async obtenerValorActual(indicadorId: string): Promise<number> {
    try {
      const { data } = await firstValueFrom(this.httpService.get(`${this.baseUrl}/${indicadorId}`));
      return data.valor;
    } catch (error) {
      console.error(`Error al obtener valor del KPI ${indicadorId}:`, error.message);
      return 0;
    }
  }
}
