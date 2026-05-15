/**
 * API Client — Grupo Cordillera
 *
 * Rutas (resueltas por el proxy de Vite):
 *   /gw    →  http://localhost:3000  (API Gateway)
 *   /ms    →  http://localhost:3001  (ms-kpis directo)
 *   /ms-eq →  http://localhost:3003  (ms-equipos directo)
 */
// MS-Equipos   (:3003)

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
  fechaCreacion: string;
  cumplimiento: string;
  estado: 'META CUMPLIDA' | 'EN PROGRESO';
}

export interface KpiRaw {
  id: string;
  nombre: string;
  valor: number;
  areaId: string;
  fechaCreacion: string;
}

export interface CreateKpiPayload {
  nombre: string;
  valor: number;
  areaId: string;
}

export interface Equipo {
  id: number;
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

export type EstadoMeta = 'EN_PROGRESO' | 'CUMPLIDA' | 'NO_CUMPLIDA';

export interface Meta {
  id: string;
  nombre: string;
  areaId: string;
  valorObjetivo: number;
  valorActual: number;
  estado: EstadoMeta;
  fechaLimite: string;
  fechaCreacion: string;
  porcentajeCumplimiento?: string;
}

export interface CreateMetaPayload {
  nombre: string;
  areaId: string;
  valorObjetivo: number;
  valorActual: number;
  fechaLimite: string;
}

export interface UpdateMetaPayload {
  nombre?: string;
  areaId?: string;
  valorObjetivo?: number;
  valorActual?: number;
  fechaLimite?: string;
}

/* ══════════════════════════════════════════════════════════════
   HELPER
══════════════════════════════════════════════════════════════ */

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

/* ── Gateway Equipos ────────────────────────────────────────── */

export async function getGatewayEquipos(token: string): Promise<Equipo[]> {
  const res = await fetch(`${GW}/api/dashboard/equipos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<Equipo[]>(res);
}

export async function crearEquipoGateway(
  token: string,
  payload: CreateEquipoPayload
): Promise<Equipo> {
  const res = await fetch(`${GW}/api/dashboard/equipos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<Equipo>(res);
}

/* ── MS-KPIs directo ────────────────────────────────────────── */

export async function getMsKpis(): Promise<KpiRaw[]> {
  const res = await fetch(`${MS}/api/kpis`);
  return handleResponse<KpiRaw[]>(res);
}

export async function createKpi(payload: CreateKpiPayload): Promise<KpiRaw> {
  const res = await fetch(`${MS}/api/kpis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<KpiRaw>(res);
}

/* ── MS-Equipos directo ─────────────────────────────────────── */

export async function getMsEquipos(): Promise<Equipo[]> {
  const res = await fetch(`${MS_EQ}/api/equipos`);
  return handleResponse<Equipo[]>(res);
}

export async function crearEquipoDirecto(payload: CreateEquipoPayload): Promise<Equipo> {
  const res = await fetch(`${MS_EQ}/api/equipos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<Equipo>(res);
}

/* ══════════════════════════════════════════════════════════════
   METAS — ms-metas :3002 (directo, sin auth)
══════════════════════════════════════════════════════════════ */

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
  const res = await fetch(`${MS_MT}/api/metas/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<{ mensaje: string }>(res);
}

/* ══════════════════════════════════════════════════════════════
   AREAS — ms-equipos :3003
══════════════════════════════════════════════════════════════ */

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