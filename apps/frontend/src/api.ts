/**
 * API Client — Grupo Cordillera
 *
 * Rutas (resueltas por el proxy de Vite):
 *   /gw    →  http://localhost:3000  (API Gateway)
 *   /ms    →  http://localhost:3001  (ms-kpis directo)
 *   /ms-eq →  http://localhost:3003  (ms-equipos directo)
 */

const GW    = '/gw';    // API Gateway  (:3000)
const MS    = '/ms';    // MS-KPIs      (:3001)
const MS_EQ = '/ms-eq'; // MS-Equipos   (:3003)

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
  departamento: string;
  cantidadIntegrantes: number;
  fechaCreacion: string;
}

export interface CreateEquipoPayload {
  nombre: string;
  lider: string;
  departamento: string;
  cantidadIntegrantes: number;
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
