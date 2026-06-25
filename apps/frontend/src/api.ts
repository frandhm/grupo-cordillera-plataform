/**
 * API Client — Grupo Cordillera
 *
 * Rutas (resueltas por el proxy de Vite):
 *   /gw    →  http://localhost:3000  (API Gateway)
 *   /ms    →  http://localhost:3001  (ms-kpis directo)
 *   /ms-eq →  http://localhost:3003  (ms-equipos directo)
 *   /ms-mt →  http://localhost:3002  (ms-metas directo)
 */

const GW = '/gw';
const MS = '/ms';
const MS_EQ = '/ms-eq';
const MS_MT = '/ms-mt';

/* ── Types ──────────────────────────────────────────────────── */

export interface LoginResponse {
  access_token: string;
  mensaje: string;
}

export interface KpiGateway {
  id: string;
  nombre: string;
  valor: number;
  areaId: string;
  descripcion?: string;
  unidadMedicion: string;
  fechaCreacion: string;
}

export interface KpiRaw {
  id: string;
  nombre: string;
  valor: number;
  areaId: string;
  descripcion?: string;
  unidadMedicion: string;
  equipoId?: string;
  responsable?: string;
  fechaCreacion: string;
}

export interface CreateKpiPayload {
  nombre: string;
  valor: number;
  areaId: string;
  descripcion?: string;
  unidadMedicion: string;
  equipoId?: string;
  responsable?: string;
}

export interface Equipo {
  id: string;       // UUID desde la corrección
  nombre: string;
  lider: string;
  areaId: string;
  area?: Area;
  cantidadIntegrantes: number;
  fechaCreacion: string;
}

export interface Area {
  id: string;
  nombre: string;
  equipos?: Equipo[];
}

export interface CreateEquipoPayload {
  nombre: string;
  lider: string;
  areaId: string;
  cantidadIntegrantes: number;
}

export interface CreateAreaPayload {
  nombre: string;
}

export type EstadoMeta = 'EN_PROGRESO' | 'EXCELENTE' | 'NO_CUMPLIDA';
export type OperadorMeta = '>=' | '<=' | '=';

export interface Meta {
  id: string;
  nombre: string;
  areaId: string;
  equipoId?: string;
  indicadorId?: string;
  periodo: string;
  fechaInicio: string;
  fechaFin: string;
  valorObjetivo: number;
  operador: OperadorMeta;
  unidad: string;
  descripcionObjetivo?: string;
  estado: EstadoMeta;
  fechaCreacion: string;
  // Campos calculados dinámicamente (no se persisten)
  valorPromedio?: number | null;
  totalMediciones?: number;
  tasaCumplimiento?: number;
}

export interface CreateMetaPayload {
  nombre: string;
  areaId: string;
  equipoId?: string;
  indicadorId?: string;
  periodo: string;
  fechaInicio: string;
  fechaFin: string;
  valorObjetivo: number;
  operador: OperadorMeta;
  unidad: string;
  descripcionObjetivo?: string;
}

export interface UpdateMetaPayload {
  nombre?: string;
  areaId?: string;
  equipoId?: string;
  indicadorId?: string;
  periodo?: string;
  fechaInicio?: string;
  fechaFin?: string;
  valorObjetivo?: number;
  operador?: OperadorMeta;
  unidad?: string;
  descripcionObjetivo?: string;
}

/* ── Helper ─────────────────────────────────────────────────── */

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = Array.isArray(body.message)
      ? body.message.join(', ')
      : body.message || `Error ${res.status}`;
    throw new Error(msg);
  }
  return res.json();
}

/* ── Auth ───────────────────────────────────────────────────── */

export async function login(usuario: string, clave: string): Promise<LoginResponse> {
  const res = await fetch(`${GW}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, clave }),
  });
  return handleResponse<LoginResponse>(res);
}

/* ── Gateway KPIs ───────────────────────────────────────────── */

export async function getGatewayKpis(token: string): Promise<KpiGateway[]> {
  const res = await fetch(`${GW}/api/dashboard/kpis`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<KpiGateway[]>(res);
}

export async function getLogs(token: string): Promise<any[]> {
  const res = await fetch(`${GW}/api/dashboard/logs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<any[]>(res);
}

/* ── KPIs — ms-kpis :3001 ───────────────────────────────────── */

export async function getMsKpis(): Promise<KpiRaw[]> {
  const res = await fetch(`${MS}/api/kpis`);
  return handleResponse<KpiRaw[]>(res);
}

export async function createKpi(payload: CreateKpiPayload, token: string): Promise<KpiRaw> {
  const res = await fetch(`${GW}/api/dashboard/kpis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<KpiRaw>(res);
}

export async function getKpiPorId(id: string): Promise<KpiRaw> {
  const res = await fetch(`${MS}/api/kpis/${id}`);
  return handleResponse<KpiRaw>(res);
}

export async function actualizarKpi(id: string, valor: number): Promise<KpiRaw> {
  const res = await fetch(`${MS}/api/kpis/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ valor }),
  });
  return handleResponse<KpiRaw>(res);
}

export async function getHistorialKpi(id: string): Promise<any[]> {
  const res = await fetch(`${MS}/api/kpis/${id}/historial`);
  return handleResponse<any[]>(res);
}

export async function eliminarKpi(id: string): Promise<{ mensaje: string }> {
  const res = await fetch(`${MS}/api/kpis/${id}`, { method: 'DELETE' });
  return handleResponse<{ mensaje: string }>(res);
}

/* ── Equipos — Gateway :3000 ────────────────────────────────── */

export async function getGatewayEquipos(token: string): Promise<Equipo[]> {
  const res = await fetch(`${GW}/api/dashboard/equipos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<Equipo[]>(res);
}

/* ── Equipos — ms-equipos :3003 ─────────────────────────────── */

export async function getMsEquipos(): Promise<Equipo[]> {
  const res = await fetch(`${MS_EQ}/api/equipos`);
  return handleResponse<Equipo[]>(res);
}

export async function crearEquipoDirecto(payload: CreateEquipoPayload, token: string): Promise<Equipo> {
  const res = await fetch(`${GW}/api/dashboard/equipos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<Equipo>(res);
}

/* ── Metas — ms-metas :3002 ─────────────────────────────────── */

export async function getMsMetas(): Promise<Meta[]> {
  const res = await fetch(`${MS_MT}/api/metas`);
  return handleResponse<Meta[]>(res);
}

export async function getMetaPorId(id: string): Promise<Meta> {
  const res = await fetch(`${MS_MT}/api/metas/${id}`);
  return handleResponse<Meta>(res);
}

export async function crearMeta(payload: CreateMetaPayload): Promise<Meta> {
  const res = await fetch(`${MS_MT}/api/metas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<Meta>(res);
}

export async function actualizarMeta(id: string, payload: UpdateMetaPayload): Promise<Meta> {
  const res = await fetch(`${MS_MT}/api/metas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<Meta>(res);
}

export async function eliminarMeta(id: string): Promise<{ mensaje: string }> {
  const res = await fetch(`${MS_MT}/api/metas/${id}`, { method: 'DELETE' });
  return handleResponse<{ mensaje: string }>(res);
}

/* ── Áreas — ms-equipos :3003 ───────────────────────────────── */

export async function getMsAreas(): Promise<Area[]> {
  const res = await fetch(`${MS_EQ}/api/areas`);
  return handleResponse<Area[]>(res);
}

export async function crearArea(payload: CreateAreaPayload): Promise<Area> {
  const res = await fetch(`${MS_EQ}/api/areas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<Area>(res);
}

/* ── BFF — Gateway :3000 ────────────────────────────────────── */

export async function getResumenConsolidado(token: string): Promise<any[]> {
  const res = await fetch(`${GW}/api/dashboard/resumen`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<any[]>(res);
}
