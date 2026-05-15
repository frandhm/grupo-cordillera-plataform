/**
 * API Client — Grupo Cordillera
 *
 * Proxies Vite (orden importa: más específicos primero):
 *   /gw    → :3000  API Gateway
 *   /ms-eq → :3003  ms-equipos  (antes que /ms para evitar match incorrecto)
 *   /ms-mt → :3002  ms-metas    (antes que /ms para evitar match incorrecto)
 *   /ms    → :3001  ms-kpis
 */

const GW    = '/gw';
const MS    = '/ms';
const MS_EQ = '/ms-eq';
const MS_MT = '/ms-mt';

/* ══════════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════════ */

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
  cumplimiento: string;
  estado: 'META CUMPLIDA' | 'EN PROGRESO';
}

export interface KpiRaw {
  id: string;
  nombre: string;
  valor: number;
  areaId: string;
  descripcion?: string;
  unidadMedicion: string;
  fechaCreacion: string;
}

export interface CreateKpiPayload {
  nombre: string;
  valor: number;
  areaId: string;
  descripcion?: string;
  unidadMedicion: string;
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
  indicadorId?: string;
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
  indicadorId?: string;
  valorObjetivo: number;
  valorActual: number;
  fechaLimite: string;
}

export interface UpdateMetaPayload {
  nombre?: string;
  areaId?: string;
  indicadorId?: string;
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

/* ══════════════════════════════════════════════════════════════
   AUTH — Gateway :3000
══════════════════════════════════════════════════════════════ */

export async function login(usuario: string, clave: string): Promise<LoginResponse> {
  const res = await fetch(`${GW}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, clave }),
  });
  return handleResponse<LoginResponse>(res);
}

/* ══════════════════════════════════════════════════════════════
   KPIs — Gateway :3000 (con JWT)
══════════════════════════════════════════════════════════════ */

export async function getGatewayKpis(token: string): Promise<KpiGateway[]> {
  const res = await fetch(`${GW}/api/dashboard/kpis`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<KpiGateway[]>(res);
}

/* ══════════════════════════════════════════════════════════════
   KPIs — ms-kpis :3001 (directo, sin auth)
══════════════════════════════════════════════════════════════ */

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
  const res = await fetch(`${MS}/api/kpis/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<{ mensaje: string }>(res);
}

/* ══════════════════════════════════════════════════════════════
   EQUIPOS — Gateway :3000 (GET con JWT)
══════════════════════════════════════════════════════════════ */

export async function getGatewayEquipos(token: string): Promise<Equipo[]> {
  const res = await fetch(`${GW}/api/dashboard/equipos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<Equipo[]>(res);
}

/* ══════════════════════════════════════════════════════════════
   EQUIPOS — ms-equipos :3003 (directo, sin auth)
   BUG FIX: El gateway POST /dashboard/equipos llama internamente
   a :3002 (que es ms-metas, no ms-equipos). Para crear equipos
   correctamente hay que ir directo al microservicio en :3003.
══════════════════════════════════════════════════════════════ */

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

/* ══════════════════════════════════════════════════════════════
   BFF — Gateway :3000
══════════════════════════════════════════════════════════════ */

export async function getResumenConsolidado(token: string): Promise<any[]> {
  const res = await fetch(`${GW}/api/dashboard/resumen`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<any[]>(res);
}
