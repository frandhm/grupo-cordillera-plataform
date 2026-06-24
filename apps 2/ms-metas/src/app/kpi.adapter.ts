export interface NormalizedKpi {
  id: string;
  nombre: string;
  valorActual: number;
  area: string;
  unidad: string;
}

export class KpiAdapter {
  /**
   * Adapta la respuesta cruda del ms-kpis a una estructura interna
   * protegida contra cambios en el microservicio externo.
   */
  static adapt(raw: any): NormalizedKpi {
    return {
      id: raw.id,
      nombre: raw.nombre,
      valorActual: raw.valor ?? 0, // Si cambia a 'value', solo cambiamos aquí
      area: raw.areaId,
      unidad: raw.unidadMedicion || 'unidades'
    };
  }
}
