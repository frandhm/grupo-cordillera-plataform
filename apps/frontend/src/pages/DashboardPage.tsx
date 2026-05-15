import { useState, useEffect, useCallback } from 'react';
import {
  getGatewayKpis, getMsKpis, createKpi,
  getGatewayEquipos, crearEquipoGateway, getMsEquipos,
  KpiGateway, KpiRaw, CreateKpiPayload,
  Equipo, CreateEquipoPayload,
} from '../api';

type Tab = 'gateway-kpis' | 'raw-kpis' | 'create-kpi' | 'gateway-equipos' | 'crear-equipo' | 'raw-equipos';

interface Props {
  token: string;
  onLogout: () => void;
}

function decodeToken(token: string): { email: string; role: string } {
  try { return JSON.parse(atob(token.split('.')[1])); }
  catch { return { email: 'usuario', role: 'admin' }; }
}

/* ─── Helpers ─────────────────────────────────────────────── */
function useAsyncData<T>(loader: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setData(await loader()); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, load, setData };
}

/* ─── Sub-components ──────────────────────────────────────── */
function SectionHeader({
  title, desc, badge, badgeType, onRefresh, loading
}: {
  title: string; desc: string; badge: string; badgeType: 'auth' | 'open';
  onRefresh?: () => void; loading?: boolean;
}) {
  return (
    <div className="section-header">
      <div>
        <h2>{title}</h2>
        <p className="section-desc">{desc}</p>
      </div>
      <div className="header-actions">
        <span className={`badge badge-${badgeType === 'auth' ? 'auth' : 'open'}`}>
          {badgeType === 'auth' ? '🔐' : '🔓'} {badge}
        </span>
        {onRefresh && (
          <button className="btn-refresh" onClick={onRefresh} disabled={loading}>
            {loading ? '...' : '↻ Actualizar'}
          </button>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   KPI CARD
══════════════════════════════════════════════════════════════ */
function KpiCard({ kpi }: { kpi: KpiGateway }) {
  const pct = Math.min(parseFloat(kpi.cumplimiento), 100);
  return (
    <div className="kpi-card">
      <div className="kpi-card-top">
        <span className="kpi-area">{kpi.areaId}</span>
        <span className={`kpi-status ${kpi.estado === 'META CUMPLIDA' ? 'status-ok' : 'status-progress'}`}>
          {kpi.estado}
        </span>
      </div>
      <div className="kpi-nombre">{kpi.nombre}</div>
      <div className="kpi-valor">{kpi.valor.toLocaleString('es-CL')}</div>
      <div className="kpi-bar-container">
        <div className="kpi-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="kpi-cumplimiento">{kpi.cumplimiento} de la meta</div>
      <div className="kpi-id">ID: {kpi.id.slice(0, 8)}…</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   EQUIPO CARD
══════════════════════════════════════════════════════════════ */
function EquipoCard({ equipo }: { equipo: Equipo }) {
  return (
    <div className="kpi-card">
      <div className="kpi-card-top">
        <span className="kpi-area">{equipo.areaId}</span>
        <span className="kpi-status status-ok">{equipo.cantidadIntegrantes} miembros</span>
      </div >
      <div className="kpi-nombre">{equipo.nombre}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
        <span style={{ fontSize: '1.1rem' }}>👤</span>
        <span style={{ fontSize: '0.9rem', color: 'var(--text)' }}>{equipo.lider}</span>
      </div>
      <div className="kpi-id" style={{ marginTop: '0.5rem' }}>
        {new Date(equipo.fechaCreacion).toLocaleDateString('es-CL')}
      </div>
    </div >
  );
}

/* ══════════════════════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════════════════════ */
export function DashboardPage({ token, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>('gateway-kpis');
  const user = decodeToken(token);

  /* KPIs */
  const gwKpis = useAsyncData(() => getGatewayKpis(token), [token]);
  const rawKpis = useAsyncData(getMsKpis, []);

  /* Equipos */
  const gwEq = useAsyncData(() => getGatewayEquipos(token), [token]);
  const rawEq = useAsyncData(getMsEquipos, []);

  /* Create KPI form */
  const emptyKpi: CreateKpiPayload & { descripcion: string, unidadMedicion: string } = {
    nombre: '',
    valor: 0,
    areaId: '',
    descripcion: '',
    unidadMedicion: ''
  };
  const [kpiForm, setKpiForm] = useState(emptyKpi);
  const [kpiCreating, setKpiCreating] = useState(false);
  const [kpiOk, setKpiOk] = useState('');
  const [kpiErr, setKpiErr] = useState('');

  /* Create Equipo form */
  const emptyEq: CreateEquipoPayload = { nombre: '', lider: '', areaId: '', cantidadIntegrantes: 0 };
  const [eqForm, setEqForm] = useState(emptyEq);
  const [eqCreating, setEqCreating] = useState(false);
  const [eqOk, setEqOk] = useState('');
  const [eqErr, setEqErr] = useState('');

  /* Auto-load on tab change */
  useEffect(() => {
    if (tab === 'gateway-kpis') gwKpis.load();
    if (tab === 'raw-kpis') rawKpis.load();
    if (tab === 'gateway-equipos') gwEq.load();
    if (tab === 'raw-equipos') rawEq.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  /* Handlers */
  const handleCreateKpi = async (e: React.FormEvent) => {
    e.preventDefault();
    setKpiCreating(true); setKpiOk(''); setKpiErr('');
    try {
      const k = await createKpi(kpiForm);
      setKpiOk(`✓ KPI creado — ID: ${k.id}`);
      setKpiForm(emptyKpi);
    } catch (e: unknown) { setKpiErr(e instanceof Error ? e.message : 'Error'); }
    finally { setKpiCreating(false); }
  };

  const handleCreateEquipo = async (e: React.FormEvent) => {
    e.preventDefault();
    setEqCreating(true); setEqOk(''); setEqErr('');
    try {
      const eq = await crearEquipoGateway(token, eqForm);
      setEqOk(`✓ Equipo "${eq.nombre}" creado — ID: ${eq.id}`);
      setEqForm(emptyEq);
    } catch (e: unknown) { setEqErr(e instanceof Error ? e.message : 'Error'); }
    finally { setEqCreating(false); }
  };

  /* Nav items config */
  const navItems: { id: Tab; icon: string; label: string; sub: string }[] = [
    { id: 'gateway-kpis', icon: '◈', label: 'KPIs Gateway', sub: 'GET :3000 · 🔐 JWT' },
    { id: 'raw-kpis', icon: '◉', label: 'KPIs Raw', sub: 'GET :3001 · Sin auth' },
    { id: 'create-kpi', icon: '◎', label: 'Crear KPI', sub: 'POST :3001 · Sin auth' },
    { id: 'gateway-equipos', icon: '◈', label: 'Equipos Gateway', sub: 'GET :3000 · 🔐 JWT' },
    { id: 'crear-equipo', icon: '◎', label: 'Crear Equipo', sub: 'POST :3000 · 🔐 JWT' },
    { id: 'raw-equipos', icon: '◉', label: 'Equipos Raw', sub: 'GET :3003 · Sin auth' },
  ];

  /* ── RENDER ── */
  return (
    <div className="dash-root">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-symbol">▲</span>
          <div>
            <div className="logo-title">CORDILLERA</div>
            <div className="logo-sub">API Testing Hub</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">KPIs</div>
          {navItems.slice(0, 3).map(n => (
            <button key={n.id} className={`nav-item ${tab === n.id ? 'active' : ''}`} onClick={() => setTab(n.id)}>
              <span className="nav-icon">{n.icon}</span>
              <span>
                <div className="nav-label">{n.label}</div>
                <div className="nav-sub">{n.sub}</div>
              </span>
            </button>
          ))}

          <div className="nav-section-label" style={{ marginTop: '0.75rem' }}>EQUIPOS</div>
          {navItems.slice(3).map(n => (
            <button key={n.id} className={`nav-item ${tab === n.id ? 'active' : ''}`} onClick={() => setTab(n.id)}>
              <span className="nav-icon">{n.icon}</span>
              <span>
                <div className="nav-label">{n.label}</div>
                <div className="nav-sub">{n.sub}</div>
              </span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user.email[0].toUpperCase()}</div>
            <div>
              <div className="user-email">{user.email}</div>
              <div className="user-role">{user.role}</div>
            </div>
          </div>
          <button className="btn-logout" onClick={onLogout}>← CERRAR SESIÓN</button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="dash-main">

        {/* ── TAB: Gateway KPIs ── */}
        {tab === 'gateway-kpis' && (
          <section className="content-section" key="gw-kpis">
            <SectionHeader title="KPIs Consolidados" desc="GET /api/dashboard/kpis · Gateway → ms-kpis (:3001)"
              badge="Bearer Token" badgeType="auth" onRefresh={gwKpis.load} loading={gwKpis.loading} />
            {gwKpis.error && <div className="alert-error">{gwKpis.error}</div>}
            {gwKpis.loading && <div className="loading-state">Consultando gateway...</div>}
            {!gwKpis.loading && !gwKpis.error && gwKpis.data?.length === 0 && (
              <div className="empty-state">Sin KPIs. Ve a <strong>Crear KPI</strong>.</div>
            )}
            <div className="kpi-grid">
              {gwKpis.data?.map(k => <KpiCard key={k.id} kpi={k} />)}
            </div>
          </section>
        )}

        {/* ── TAB: Raw KPIs ── */}
        {tab === 'raw-kpis' && (
          <section className="content-section" key="raw-kpis">
            <SectionHeader title="KPIs Raw" desc="GET /api/kpis · Directo a ms-kpis (:3001)"
              badge="Sin Autenticación" badgeType="open" onRefresh={rawKpis.load} loading={rawKpis.loading} />
            {rawKpis.error && <div className="alert-error">{rawKpis.error}</div>}
            {rawKpis.loading && <div className="loading-state">Consultando microservicio...</div>}
            {!rawKpis.loading && !rawKpis.error && rawKpis.data?.length === 0 && (
              <div className="empty-state">Sin datos. ¿El ms-kpis está corriendo en :3001?</div>
            )}
            {rawKpis.data && rawKpis.data.length > 0 && (
              <div className="table-wrapper">
                <table className="kpi-table">
                  <thead><tr><th>ID</th><th>NOMBRE</th><th>VALOR</th><th>ÁREA</th><th>FECHA</th></tr></thead>
                  <tbody>
                    {rawKpis.data.map(k => (
                      <tr key={k.id}>
                        <td className="mono">{k.id.slice(0, 8)}…</td>
                        <td>{k.nombre}</td>
                        <td className="mono">{k.valor.toLocaleString('es-CL')}</td>
                        <td><span className="area-tag">{k.areaId}</span></td>
                        <td className="mono">{new Date(k.fechaCreacion).toLocaleString('es-CL')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ── TAB: Crear KPI ── */}
        {tab === 'create-kpi' && (
          <section className="content-section" key="create-kpi">
            <SectionHeader title="Crear KPI" desc="POST /api/kpis · Directo a ms-kpis (:3001)"
              badge="Sin Autenticación" badgeType="open" />
            <div className="create-layout">
              <form className="create-form" onSubmit={handleCreateKpi}>
                <div className="field-group">
                  <label>NOMBRE DEL KPI</label>
                  <input type="text" value={kpiForm.nombre} required placeholder="Ej: Ventas Retail Q2"
                    onChange={e => setKpiForm(f => ({ ...f, nombre: e.target.value }))} />
                </div>
                <div className="field-group">
                  <label>VALOR</label>
                  <input type="number" min={0} step="any" required placeholder="Ej: 15000"
                    value={kpiForm.valor === 0 ? '' : kpiForm.valor}
                    onChange={e => setKpiForm(f => ({ ...f, valor: e.target.value === '' ? 0 : parseFloat(e.target.value) }))} />
                </div>
                <div className="field-group">
                  <label>ÁREA ID</label>
                  <input type="text" value={kpiForm.areaId} required placeholder="Ej: ventas-sur"
                    onChange={e => setKpiForm(f => ({ ...f, areaId: e.target.value }))} />
                </div>
                <div className="field-group">
                  <label>DESCRIPCIÓN</label>
                  <textarea value={kpiForm.descripcion} placeholder="Opcional"
                    onChange={e => setKpiForm(f => ({ ...f, descripcion: e.target.value }))} />
                </div>
                <div className="field-group">
                  <label>UNIDAD DE MEDICIÓN</label>
                  <input type="text" value={kpiForm.unidadMedicion} required placeholder="Ej: CLP, %, Unidades"
                    onChange={e => setKpiForm(f => ({ ...f, unidadMedicion: e.target.value }))} />
                </div>
                {kpiErr && <div className="alert-error">{kpiErr}</div>}
                {kpiOk && <div className="alert-success">{kpiOk}</div>}
                <button type="submit" className="btn-create" disabled={kpiCreating}>
                  {kpiCreating ? 'GUARDANDO...' : '+ CREAR KPI'}
                </button>
              </form>
              <div className="request-preview">
                <div className="preview-label">PREVIEW DEL REQUEST</div>
                <pre className="preview-code">{JSON.stringify({ method: 'POST', url: 'http://localhost:3001/api/kpis', body: { nombre: kpiForm.nombre || '…', valor: kpiForm.valor, areaId: kpiForm.areaId || '…' } }, null, 2)}</pre>
              </div>
            </div>
          </section>
        )}

        {/* ── TAB: Equipos Gateway ── */}
        {tab === 'gateway-equipos' && (
          <section className="content-section" key="gw-equipos">
            <SectionHeader title="Equipos" desc="GET /api/dashboard/equipos · Gateway → ms-equipos (:3003)"
              badge="Bearer Token" badgeType="auth" onRefresh={gwEq.load} loading={gwEq.loading} />
            {gwEq.error && <div className="alert-error">{gwEq.error}</div>}
            {gwEq.loading && <div className="loading-state">Consultando equipos...</div>}
            {!gwEq.loading && !gwEq.error && gwEq.data?.length === 0 && (
              <div className="empty-state">Sin equipos. Ve a <strong>Crear Equipo</strong>.</div>
            )}
            <div className="kpi-grid">
              {gwEq.data?.map(eq => <EquipoCard key={eq.id} equipo={eq} />)}
            </div>
          </section>
        )}

        {/* ── TAB: Crear Equipo ── */}
        {tab === 'crear-equipo' && (
          <section className="content-section" key="crear-equipo">
            <SectionHeader title="Crear Equipo" desc="POST /api/dashboard/equipos · Gateway → ms-equipos (:3002)"
              badge="Bearer Token" badgeType="auth" />
            <div className="create-layout">
              <form className="create-form" onSubmit={handleCreateEquipo}>
                <div className="field-group">
                  <label>NOMBRE DEL EQUIPO</label>
                  <input type="text" value={eqForm.nombre} required placeholder="Ej: Ventas Norte"
                    onChange={e => setEqForm(f => ({ ...f, nombre: e.target.value }))} />
                </div>
                <div className="field-group">
                  <label>LÍDER</label>
                  <input type="text" value={eqForm.lider} required placeholder="Ej: Scarleth García"
                    onChange={e => setEqForm(f => ({ ...f, lider: e.target.value }))} />
                </div>
                <div className="field-group">
                  <label>ID DEL ÁREA</label>
                  <input type="text" value={eqForm.areaId} required placeholder="Ej: uuid-de-area"
                    onChange={e => setEqForm(f => ({ ...f, areaId: e.target.value }))} />
                </div>
                <div className="field-group">
                  <label>CANTIDAD DE INTEGRANTES</label>
                  <input type="number" min={0} required placeholder="Ej: 5"
                    value={eqForm.cantidadIntegrantes === 0 ? '' : eqForm.cantidadIntegrantes}
                    onChange={e => setEqForm(f => ({ ...f, cantidadIntegrantes: e.target.value === '' ? 0 : parseInt(e.target.value) }))} />
                </div>
                {eqErr && <div className="alert-error">{eqErr}</div>}
                {eqOk && <div className="alert-success">{eqOk}</div>}
                <button type="submit" className="btn-create" disabled={eqCreating}>
                  {eqCreating ? 'GUARDANDO...' : '+ CREAR EQUIPO'}
                </button>
              </form>
              <div className="request-preview">
                <div className="preview-label">PREVIEW DEL REQUEST</div>
                <pre className="preview-code">{JSON.stringify({ method: 'POST', url: 'http://localhost:3000/api/dashboard/equipos', headers: { Authorization: 'Bearer <token>' }, body: { nombre: eqForm.nombre || '…', lider: eqForm.lider || '…', departamento: eqForm.areaId || '…', cantidadIntegrantes: eqForm.cantidadIntegrantes } }, null, 2)}</pre>
              </div>
            </div>
          </section>
        )}

        {/* ── TAB: Raw Equipos ── */}
        {tab === 'raw-equipos' && (
          <section className="content-section" key="raw-eq">
            <SectionHeader title="Equipos Raw" desc="GET /api/equipos · Directo a ms-equipos (:3003)"
              badge="Sin Autenticación" badgeType="open" onRefresh={rawEq.load} loading={rawEq.loading} />
            {rawEq.error && <div className="alert-error">{rawEq.error}</div>}
            {rawEq.loading && <div className="loading-state">Consultando ms-equipos...</div>}
            {!rawEq.loading && !rawEq.error && rawEq.data?.length === 0 && (
              <div className="empty-state">Sin equipos. ¿El ms-equipos está corriendo en :3003?</div>
            )}
            {rawEq.data && rawEq.data.length > 0 && (
              <div className="table-wrapper">
                <table className="kpi-table">
                  <thead><tr><th>ID</th><th>NOMBRE</th><th>LÍDER</th><th>DEPARTAMENTO</th><th>INTEGRANTES</th><th>FECHA</th></tr></thead>
                  <tbody>
                    {rawEq.data.map(eq => (
                      <tr key={eq.id}>
                        <td className="mono">{eq.id}</td>
                        <td>{eq.nombre}</td>
                        <td>{eq.lider}</td>
                        <td><span className="area-tag">{eq.areaId}</span></td>
                        <td className="mono" style={{ textAlign: 'center' }}>{eq.cantidadIntegrantes}</td>
                        <td className="mono">{new Date(eq.fechaCreacion).toLocaleDateString('es-CL')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

      </main>
    </div>
  );
}
