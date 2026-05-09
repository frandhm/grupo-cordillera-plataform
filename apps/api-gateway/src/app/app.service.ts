import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) { }

  // Esta función es el "puente" hacia tu microservicio de KPIs
  async obtenerKpisDesdeMicroservicio() {
    // El Gateway llama al puerto 3001 que es donde vive tu MS-KPIs
    const url = 'http://localhost:3001/api/kpis';
    const { data } = await firstValueFrom(this.httpService.get(url));
    return data;
  }
}