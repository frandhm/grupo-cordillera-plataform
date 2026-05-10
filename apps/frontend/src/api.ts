/**
 * API Client — Grupo Cordillera
 *
 * Rutas (resueltas por el proxy de Vite):
 *   /gw  →  http://localhost:3000  (API Gateway)
 *   /ms  →  http://localhost:3001  (ms-kpis directo)
 */

const GW = '/gw'; // API Gateway  (:3000)
const MS = '/ms'; // MS-KPIs      (:3001)

/* ── Types ──────────────────────────────────────────────────── */

export interface LoginResponse {
  access_token: string;
  mensaje: string;
}

/** KPI enriquecido que devuelve el Gateway (con cumplimiento y estado) */
export interface KpiGateway {
  id: string;
  nombre: string;
  valor: number;
  areaId: string;
  fechaCreacion: string;
  cumplimiento: string;
  estado: 'META CUMPLIDA' | 'EN PROGRESO';
}

/** KPI crudo que devuelve el microservicio directamente */
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

/* ── Helper ─────────────────────────────────────────────────── */

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // NestJS envuelve los errores en { message: string | string[] }
    const msg = Array.isArray(body.message)
      ? body.message.join(', ')
      : body.message || `Error ${res.status}`;
    throw new Error(msg);
  }
  return res.json();
}

/* ── Auth ───────────────────────────────────────────────────── */

/**
 * POST /api/auth/login  →  { access_token, mensaje }
 */
export async function login(
  usuario: string,
  clave: string
): Promise<LoginResponse> {
  const res = await fetch(`${GW}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, clave }),
  });
  return handleResponse<LoginResponse>(res);
}

/* ── Gateway KPIs ───────────────────────────────────────────── */

/**
 * GET /api/dashboard/kpis  →  KpiGateway[]
 * Requiere Bearer token.
 */
export async function getGatewayKpis(token: string): Promise<KpiGateway[]> {
  const res = await fetch(`${GW}/api/dashboard/kpis`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<KpiGateway[]>(res);
}

/* ── MS-KPIs directo ────────────────────────────────────────── */

/**
 * GET /api/kpis  →  KpiRaw[]
 * Sin autenticación — acceso directo al microservicio.
 */
export async function getMsKpis(): Promise<KpiRaw[]> {
  const res = await fetch(`${MS}/api/kpis`);
  return handleResponse<KpiRaw[]>(res);
}

/**
 * POST /api/kpis  →  KpiRaw
 * Crea un nuevo KPI directamente en el microservicio.
 */
export async function createKpi(payload: CreateKpiPayload): Promise<KpiRaw> {
  const res = await fetch(`${MS}/api/kpis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<KpiRaw>(res);
}
