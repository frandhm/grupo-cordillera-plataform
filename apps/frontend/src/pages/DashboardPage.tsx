import { useState, useEffect, useCallback } from 'react';
import {
  getGatewayKpis,
  getMsKpis,
  createKpi,
  KpiGateway,
  KpiRaw,
  CreateKpiPayload,
} from '../api';

type Tab = 'gateway' | 'raw' | 'create';

interface Props {
  token: string;
  onLogout: () => void;
}

/* ── Decode JWT payload (no verification — solo para mostrar info) ── */
function decodeToken(token: string): { email: string; role: string } {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return { email: 'usuario', role: 'admin' };
  }
}

/* ═══════════════════════════════════════════════════════════════ */

export function DashboardPage({ token, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>('gateway');
  const user = decodeToken(token);

  /* ── Gateway KPIs state ── */
  const [gwKpis, setGwKpis]       = useState<KpiGateway[]>([]);
  const [gwLoading, setGwLoading] = useState(false);
  const [gwError, setGwError]     = useState('');

  /* ── Raw KPIs state ── */
  const [rawKpis, setRawKpis]       = useState<KpiRaw[]>([]);
  const [rawLoading, setRawLoading] = useState(false);
  const [rawError, setRawError]     = useState('');

  /* ── Create KPI state ── */
  const emptyForm: CreateKpiPayload = { nombre: '', valor: 0, areaId: '' };
  const [form, setForm]           = useState<CreateKpiPayload>(emptyForm);
  const [creating, setCreating]   = useState(false);
  const [createOk, setCreateOk]   = useState('');
  const [createErr, setCreateErr] = useState('');

  /* ── Loaders ── */
  const loadGw = useCallback(async () => {
    setGwLoading(true);
    setGwError('');
    try {
      setGwKpis(await getGatewayKpis(token));
    } catch (e: unknown) {
      setGwError(e instanceof Error ? e.message : 'Error');
    } finally {
      setGwLoading(false);
    }
  }, [token]);

  const loadRaw = useCallback(async () => {
    setRawLoading(true);
    setRawError('');
    try {
      setRawKpis(await getMsKpis());
    } catch (e: unknown) {
      setRawError(e instanceof Error ? e.message : 'Error');
    } finally {
      setRawLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'gateway') loadGw();
    if (tab === 'raw')     loadRaw();
  }, [tab, loadGw, loadRaw]);

  /* ── Create handler ── */
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateOk('');
    setCreateErr('');
    try {
      const kpi = await createKpi(form);
      setCreateOk(`✓ KPI creado — ID: ${kpi.id}`);
      setForm(emptyForm);
    } catch (e: unknown) {
      setCreateErr(e instanceof Error ? e.message : 'Error al crear');
    } finally {
      setCreating(false);
    }
  };

  /* ─────────────────────────────────────────────────────────── */
  return (
    <div className="dash-root">

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-symbol">▲</span>
          <div>
            <div className="logo-title">CORDILLERA</div>
            <div className="logo-sub">API Testing Hub</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">ENDPOINTS</div>

          <button
            className={`nav-item ${tab === 'gateway' ? 'active' : ''}`}
            onClick={() => setTab('gateway')}
          >
            <span className="nav-icon">◈</span>
            <span>
              <div className="nav-label">KPIs Gateway</div>
              <div className="nav-sub">GET :3000 · 🔐 JWT</div>
            </span>
          </button>

          <button
            className={`nav-item ${tab === 'raw' ? 'active' : ''}`}
            onClick={() => setTab('raw')}
          >
            <span className="nav-icon">◉</span>
            <span>
              <div className="nav-label">KPIs Raw</div>
              <div className="nav-sub">GET :3001 · Sin auth</div>
            </span>
          </button>

          <button
            className={`nav-item ${tab === 'create' ? 'active' : ''}`}
            onClick={() => setTab('create')}
          >
            <span className="nav-icon">◎</span>
            <span>
              <div className="nav-label">Crear KPI</div>
              <div className="nav-sub">POST :3001 · Sin auth</div>
            </span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user.email[0].toUpperCase()}
            </div>
            <div>
              <div className="user-email">{user.email}</div>
              <div className="user-role">{user.role}</div>
            </div>
          </div>
          <button className="btn-logout" onClick={onLogout}>
            ← CERRAR SESIÓN
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="dash-main">

        {/* TAB: Gateway KPIs */}
        {tab === 'gateway' && (
          <section className="content-section" key="gateway">
            <div className="section-header">
              <div>
                <h2>KPIs Consolidados</h2>
                <p className="section-desc">
                  GET /api/dashboard/kpis · Gateway → ms-kpis
                </p>
              </div>
              <div className="header-actions">
                <span className="badge badge-auth">🔐 Bearer Token</span>
                <button
                  className="btn-refresh"
                  onClick={loadGw}
                  disabled={gwLoading}
                >
                  {gwLoading ? '...' : '↻ Actualizar'}
                </button>
              </div>
            </div>

            {gwError   && <div className="alert-error">{gwError}</div>}
            {gwLoading && <div className="loading-state">Consultando gateway...</div>}

            {!gwLoading && gwKpis.length === 0 && !gwError && (
              <div className="empty-state">
                Sin KPIs aún. Ve a <strong>Crear KPI</strong> para agregar datos.
              </div>
            )}

            <div className="kpi-grid">
              {gwKpis.map(kpi => (
                <div key={kpi.id} className="kpi-card">
                  <div className="kpi-card-top">
                    <span className="kpi-area">{kpi.areaId}</span>
                    <span
                      className={`kpi-status ${
                        kpi.estado === 'META CUMPLIDA'
                          ? 'status-ok'
                          : 'status-progress'
                      }`}
                    >
                      {kpi.estado}
                    </span>
                  </div>

                  <div className="kpi-nombre">{kpi.nombre}</div>

                  <div className="kpi-valor">
                    {kpi.valor.toLocaleString('es-CL')}
                  </div>

                  <div className="kpi-bar-container">
                    <div
                      className="kpi-bar-fill"
                      style={{
                        width: `${Math.min(
                          parseFloat(kpi.cumplimiento),
                          100
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="kpi-cumplimiento">
                    {kpi.cumplimiento} de la meta
                  </div>

                  <div className="kpi-id">
                    ID: {kpi.id.slice(0, 8)}…
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB: Raw KPIs */}
        {tab === 'raw' && (
          <section className="content-section" key="raw">
            <div className="section-header">
              <div>
                <h2>KPIs Raw</h2>
                <p className="section-desc">
                  GET /api/kpis · Directo a ms-kpis (:3001)
                </p>
              </div>
              <div className="header-actions">
                <span className="badge badge-open">🔓 Sin Autenticación</span>
                <button
                  className="btn-refresh"
                  onClick={loadRaw}
                  disabled={rawLoading}
                >
                  {rawLoading ? '...' : '↻ Actualizar'}
                </button>
              </div>
            </div>

            {rawError   && <div className="alert-error">{rawError}</div>}
            {rawLoading && <div className="loading-state">Consultando microservicio...</div>}

            {!rawLoading && rawKpis.length === 0 && !rawError && (
              <div className="empty-state">
                Sin datos. ¿El ms-kpis está corriendo en :3001?
              </div>
            )}

            {!rawLoading && rawKpis.length > 0 && (
              <div className="table-wrapper">
                <table className="kpi-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>NOMBRE</th>
                      <th>VALOR</th>
                      <th>ÁREA</th>
                      <th>FECHA CREACIÓN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rawKpis.map(kpi => (
                      <tr key={kpi.id}>
                        <td className="mono">{kpi.id.slice(0, 8)}…</td>
                        <td>{kpi.nombre}</td>
                        <td className="mono">
                          {kpi.valor.toLocaleString('es-CL')}
                        </td>
                        <td>
                          <span className="area-tag">{kpi.areaId}</span>
                        </td>
                        <td className="mono">
                          {new Date(kpi.fechaCreacion).toLocaleString('es-CL')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* TAB: Crear KPI */}
        {tab === 'create' && (
          <section className="content-section" key="create">
            <div className="section-header">
              <div>
                <h2>Crear KPI</h2>
                <p className="section-desc">
                  POST /api/kpis · Directo a ms-kpis (:3001) → PostgreSQL
                </p>
              </div>
              <span className="badge badge-open">🔓 Sin Autenticación</span>
            </div>

            <div className="create-layout">
              {/* Form */}
              <form className="create-form" onSubmit={handleCreate}>
                <div className="field-group">
                  <label htmlFor="nombre">NOMBRE DEL KPI</label>
                  <input
                    id="nombre"
                    type="text"
                    value={form.nombre}
                    onChange={e =>
                      setForm(f => ({ ...f, nombre: e.target.value }))
                    }
                    placeholder="Ej: Ventas Retail Q2"
                    required
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="valor">VALOR</label>
                  <input
                    id="valor"
                    type="number"
                    value={form.valor === 0 ? '' : form.valor}
                    min={0}
                    step="any"
                    onChange={e =>
                      setForm(f => ({
                        ...f,
                        valor: e.target.value === '' ? 0 : parseFloat(e.target.value),
                      }))
                    }
                    placeholder="Ej: 15000"
                    required
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="areaId">ÁREA ID</label>
                  <input
                    id="areaId"
                    type="text"
                    value={form.areaId}
                    onChange={e =>
                      setForm(f => ({ ...f, areaId: e.target.value }))
                    }
                    placeholder="Ej: ventas-sur"
                    required
                  />
                </div>

                {createErr && <div className="alert-error">{createErr}</div>}
                {createOk  && <div className="alert-success">{createOk}</div>}

                <button
                  type="submit"
                  className="btn-create"
                  disabled={creating}
                >
                  {creating ? 'GUARDANDO...' : '+ CREAR KPI'}
                </button>
              </form>

              {/* Request preview */}
              <div className="request-preview">
                <div className="preview-label">PREVIEW DEL REQUEST</div>
                <pre className="preview-code">
                  {JSON.stringify(
                    {
                      method: 'POST',
                      url: 'http://localhost:3001/api/kpis',
                      body: {
                        nombre: form.nombre || '…',
                        valor:  form.valor,
                        areaId: form.areaId || '…',
                      },
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
