import { useState, useEffect, useCallback } from 'react';
import {
  getGatewayKpis, getMsKpis, createKpi,
  getGatewayEquipos, getMsEquipos, crearEquipoDirecto,
  getMsMetas, crearMeta, actualizarMeta, eliminarMeta,
  KpiGateway, CreateKpiPayload,
  Equipo, CreateEquipoPayload,
  Meta, CreateMetaPayload, EstadoMeta,
} from '../api';

type Tab =
  | 'gateway-kpis' | 'raw-kpis'    | 'create-kpi'
  | 'gateway-eq'   | 'crear-equipo' | 'raw-eq'
  | 'metas'        | 'crear-meta'   | 'editar-meta';

interface Props { token: string; onLogout: () => void; }

function decodeToken(t: string): { email: string; role: string } {
  try { return JSON.parse(atob(t.split('.')[1])); }
  catch { return { email: 'usuario', role: 'admin' }; }
}

/* ── useAsyncData hook ───────────────────────────────────────── */
function useAsyncData<T>(loader: () => Promise<T>, deps: unknown[]) {
  const [data, setData]       = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setData(await loader()); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, loading, error, load, setData };
}

/* ── SectionHeader ───────────────────────────────────────────── */
function SectionHeader({ title, desc, badge, badgeType, onRefresh, loading }: {
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

/* ── KpiCard ─────────────────────────────────────────────────── */
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

/* ── EquipoCard ──────────────────────────────────────────────── */
function EquipoCard({ equipo }: { equipo: Equipo }) {
  return (
    <div className="kpi-card">
      <div className="kpi-card-top">
        <span className="kpi-area">{equipo.departamento}</span>
        <span className="kpi-status status-ok">{equipo.cantidadIntegrantes} miembros</span>
      </div>
      <div className="kpi-nombre">{equipo.nombre}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
        <span>👤</span>
        <span style={{ fontSize: '0.9rem', color: 'var(--text)' }}>{equipo.lider}</span>
      </div>
      <div className="kpi-id" style={{ marginTop: '0.5rem' }}>
        {new Date(equipo.fechaCreacion).toLocaleDateString('es-CL')}
      </div>
    </div>
  );
}

/* ── MetaCard ────────────────────────────────────────────────── */
const ESTADO_CLASS: Record<EstadoMeta, string> = {
  CUMPLIDA:    'status-ok',
  EN_PROGRESO: 'status-progress',
  NO_CUMPLIDA: 'status-nocumplida',
};

function MetaCard({ meta, onEditar, onEliminar }: {
  meta: Meta;
  onEditar: (m: Meta) => void;
  onEliminar: (id: string) => void;
}) {
  const pct = Math.min((meta.valorActual / meta.valorObjetivo) * 100, 100);
  return (
    <div className="kpi-card">
      <div className="kpi-card-top">
        <span className="kpi-area">{meta.areaId}</span>
        <span className={`kpi-status ${ESTADO_CLASS[meta.estado as EstadoMeta] ?? 'status-progress'}`}>
          {meta.estado.replace('_', ' ')}
        </span>
      </div>
      <div className="kpi-nombre">{meta.nombre}</div>
      <div className="kpi-valor">{meta.valorActual.toLocaleString('es-CL')}</div>
      <div className="kpi-bar-container">
        <div className="kpi-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="kpi-cumplimiento">
        {meta.porcentajeCumplimiento ?? `${pct.toFixed(2)}%`} · objetivo: {meta.valorObjetivo.toLocaleString('es-CL')}
      </div>
      <div className="kpi-id">Límite: {new Date(meta.fechaLimite).toLocaleDateString('es-CL')}</div>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
        <button className="btn-refresh" style={{ flex: 1 }} onClick={() => onEditar(meta)}>✎ Editar</button>
        <button
          className="btn-refresh"
          style={{ flex: 1, borderColor: 'var(--red)', color: 'var(--red)' }}
          onClick={() => onEliminar(meta.id)}
        >✕ Eliminar</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════════════════════ */
export function DashboardPage({ token, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>('gateway-kpis');
  const user = decodeToken(token);

  /* Data hooks */
  const gwKpis = useAsyncData(() => getGatewayKpis(token), [token]);
  const rawKpis = useAsyncData(getMsKpis, []);
  const gwEq   = useAsyncData(() => getGatewayEquipos(token), [token]);
  const rawEq  = useAsyncData(getMsEquipos, []);
  const metas  = useAsyncData(getMsMetas, []);

  /* Create KPI form */
  const emptyKpi: CreateKpiPayload = { nombre: '', valor: 0, areaId: '' };
  const [kpiForm, setKpiForm]         = useState(emptyKpi);
  const [kpiCreating, setKpiCreating] = useState(false);
  const [kpiOk, setKpiOk]             = useState('');
  const [kpiErr, setKpiErr]           = useState('');

  /* Create Equipo form */
  const emptyEq: CreateEquipoPayload = { nombre: '', lider: '', departamento: '', cantidadIntegrantes: 0 };
  const [eqForm, setEqForm]         = useState(emptyEq);
  const [eqCreating, setEqCreating] = useState(false);
  const [eqOk, setEqOk]             = useState('');
  const [eqErr, setEqErr]           = useState('');

  /* Create/Edit Meta form */
  const emptyMeta: CreateMetaPayload = { nombre: '', areaId: '', valorObjetivo: 0, valorActual: 0, fechaLimite: '' };
  const [metaForm, setMetaForm]         = useState(emptyMeta);
  const [editMetaId, setEditMetaId]     = useState<string | null>(null);
  const [metaCreating, setMetaCreating] = useState(false);
  const [metaOk, setMetaOk]             = useState('');
  const [metaErr, setMetaErr]           = useState('');
  const [deletingId, setDeletingId]     = useState<string | null>(null);

  /* Auto-load */
  useEffect(() => {
    if (tab === 'gateway-kpis') gwKpis.load();
    if (tab === 'raw-kpis')     rawKpis.load();
    if (tab === 'gateway-eq')   gwEq.load();
    if (tab === 'raw-eq')       rawEq.load();
    if (tab === 'metas')        metas.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  /* ── Handlers ── */
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
      /* BUG FIX: Se llama directo a ms-equipos (:3003) porque el
         gateway POST /dashboard/equipos apunta internamente a :3002
         que es ms-metas, no ms-equipos. */
      const eq = await crearEquipoDirecto(eqForm);
      setEqOk(`✓ Equipo "${eq.nombre}" creado — ID: ${eq.id}`);
      setEqForm(emptyEq);
    } catch (e: unknown) { setEqErr(e instanceof Error ? e.message : 'Error'); }
    finally { setEqCreating(false); }
  };

  const handleCreateMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    setMetaCreating(true); setMetaOk(''); setMetaErr('');
    try {
      if (editMetaId) {
        await actualizarMeta(editMetaId, metaForm);
        setMetaOk(`✓ Meta actualizada`);
      } else {
        const m = await crearMeta(metaForm);
        setMetaOk(`✓ Meta creada — ID: ${m.id}`);
      }
      setMetaForm(emptyMeta);
      setEditMetaId(null);
      metas.load();
    } catch (e: unknown) { setMetaErr(e instanceof Error ? e.message : 'Error'); }
    finally { setMetaCreating(false); }
  };

  const handleEditarMeta = (meta: Meta) => {
    setMetaForm({
      nombre: meta.nombre,
      areaId: meta.areaId,
      valorObjetivo: meta.valorObjetivo,
      valorActual: meta.valorActual,
      fechaLimite: meta.fechaLimite,
    });
    setEditMetaId(meta.id);
    setMetaOk(''); setMetaErr('');
    setTab('crear-meta');
  };

  const handleEliminarMeta = async (id: string) => {
    if (!confirm('¿Eliminar esta meta?')) return;
    setDeletingId(id);
    try {
      await eliminarMeta(id);
      metas.setData(prev => prev ? prev.filter(m => m.id !== id) : prev);
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Error al eliminar'); }
    finally { setDeletingId(null); }
  };

  /* ── Nav config ── */
  const navGroups = [
    {
      label: 'KPIs',
      items: [
        { id: 'gateway-kpis' as Tab, icon: '◈', label: 'KPIs Gateway',  sub: 'GET :3000 · 🔐 JWT' },
        { id: 'raw-kpis'     as Tab, icon: '◉', label: 'KPIs Raw',      sub: 'GET :3001 · Sin auth' },
        { id: 'create-kpi'   as Tab, icon: '◎', label: 'Crear KPI',     sub: 'POST :3001 · Sin auth' },
      ],
    },
    {
      label: 'EQUIPOS',
      items: [
        { id: 'gateway-eq'   as Tab, icon: '◈', label: 'Equipos Gateway', sub: 'GET :3000 · 🔐 JWT' },
        { id: 'crear-equipo' as Tab, icon: '◎', label: 'Crear Equipo',    sub: 'POST :3003 · Sin auth' },
        { id: 'raw-eq'       as Tab, icon: '◉', label: 'Equipos Raw',     sub: 'GET :3003 · Sin auth' },
      ],
    },
    {
      label: 'METAS',
      items: [
        { id: 'metas'      as Tab, icon: '◈', label: 'Ver Metas',   sub: 'GET :3002 · Sin auth' },
        { id: 'crear-meta' as Tab, icon: '◎', label: editMetaId ? 'Editando Meta' : 'Crear Meta', sub: `${editMetaId ? 'PUT' : 'POST'} :3002 · Sin auth` },
      ],
    },
  ];

  /* ══════════════════════════════════════════════════════════════ */
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
          {navGroups.map(group => (
            <div key={group.label}>
              <div className="nav-section-label" style={{ marginTop: '0.5rem' }}>{group.label}</div>
              {group.items.map(n => (
                <button
                  key={n.id}
                  className={`nav-item ${tab === n.id ? 'active' : ''}`}
                  onClick={() => setTab(n.id)}
                >
                  <span className="nav-icon">{n.icon}</span>
                  <span>
                    <div className="nav-label">{n.label}</div>
                    <div className="nav-sub">{n.sub}</div>
                  </span>
                </button>
              ))}
            </div>
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

      {/* ── MAIN ── */}
      <main className="dash-main">

        {/* TAB: Gateway KPIs */}
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

        {/* TAB: Raw KPIs */}
        {tab === 'raw-kpis' && (
          <section className="content-section" key="raw-kpis">
            <SectionHeader title="KPIs Raw" desc="GET /api/kpis · Directo a ms-kpis (:3001)"
              badge="Sin Autenticación" badgeType="open" onRefresh={rawKpis.load} loading={rawKpis.loading} />
            {rawKpis.error && <div className="alert-error">{rawKpis.error}</div>}
            {rawKpis.loading && <div className="loading-state">Consultando ms-kpis...</div>}
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

        {/* TAB: Crear KPI */}
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
                {kpiErr && <div className="alert-error">{kpiErr}</div>}
                {kpiOk  && <div className="alert-success">{kpiOk}</div>}
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

        {/* TAB: Equipos Gateway */}
        {tab === 'gateway-eq' && (
          <section className="content-section" key="gw-eq">
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

        {/* TAB: Crear Equipo — BUG FIX: directo a :3003 */}
        {tab === 'crear-equipo' && (
          <section className="content-section" key="crear-eq">
            <SectionHeader
              title="Crear Equipo"
              desc="POST /api/equipos · Directo a ms-equipos (:3003) — gateway POST tiene bug de puerto"
              badge="Sin Autenticación" badgeType="open" />
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
                  <label>DEPARTAMENTO</label>
                  <input type="text" value={eqForm.departamento} required placeholder="Ej: Comercial"
                    onChange={e => setEqForm(f => ({ ...f, departamento: e.target.value }))} />
                </div>
                <div className="field-group">
                  <label>CANTIDAD DE INTEGRANTES</label>
                  <input type="number" min={0} required placeholder="Ej: 5"
                    value={eqForm.cantidadIntegrantes === 0 ? '' : eqForm.cantidadIntegrantes}
                    onChange={e => setEqForm(f => ({ ...f, cantidadIntegrantes: e.target.value === '' ? 0 : parseInt(e.target.value) }))} />
                </div>
                {eqErr && <div className="alert-error">{eqErr}</div>}
                {eqOk  && <div className="alert-success">{eqOk}</div>}
                <button type="submit" className="btn-create" disabled={eqCreating}>
                  {eqCreating ? 'GUARDANDO...' : '+ CREAR EQUIPO'}
                </button>
              </form>
              <div className="request-preview">
                <div className="preview-label">PREVIEW DEL REQUEST</div>
                <pre className="preview-code">{JSON.stringify({ method: 'POST', url: 'http://localhost:3003/api/equipos', body: { nombre: eqForm.nombre || '…', lider: eqForm.lider || '…', departamento: eqForm.departamento || '…', cantidadIntegrantes: eqForm.cantidadIntegrantes } }, null, 2)}</pre>
              </div>
            </div>
          </section>
        )}

        {/* TAB: Equipos Raw */}
        {tab === 'raw-eq' && (
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
                        <td><span className="area-tag">{eq.departamento}</span></td>
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

        {/* TAB: Metas */}
        {tab === 'metas' && (
          <section className="content-section" key="metas">
            <SectionHeader title="Metas" desc="GET /api/metas · Directo a ms-metas (:3002)"
              badge="Sin Autenticación" badgeType="open" onRefresh={metas.load} loading={metas.loading} />
            {metas.error && <div className="alert-error">{metas.error}</div>}
            {metas.loading && <div className="loading-state">Consultando ms-metas...</div>}
            {!metas.loading && !metas.error && metas.data?.length === 0 && (
              <div className="empty-state">Sin metas. Ve a <strong>Crear Meta</strong>.</div>
            )}
            <div className="kpi-grid">
              {metas.data?.map(m => (
                <MetaCard
                  key={m.id}
                  meta={m}
                  onEditar={handleEditarMeta}
                  onEliminar={deletingId === m.id ? () => {} : handleEliminarMeta}
                />
              ))}
            </div>
          </section>
        )}

        {/* TAB: Crear / Editar Meta */}
        {tab === 'crear-meta' && (
          <section className="content-section" key="crear-meta">
            <SectionHeader
              title={editMetaId ? 'Editar Meta' : 'Crear Meta'}
              desc={editMetaId
                ? `PUT /api/metas/${editMetaId.slice(0,8)}… · ms-metas (:3002)`
                : 'POST /api/metas · Directo a ms-metas (:3002)'}
              badge="Sin Autenticación" badgeType="open"
            />
            {editMetaId && (
              <div style={{ marginBottom: '1rem' }}>
                <span className="badge badge-auth" style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid rgba(240,165,0,0.25)' }}>
                  ✎ Modo edición — ID: {editMetaId.slice(0, 8)}…
                </span>
                <button className="btn-refresh" style={{ marginLeft: '0.75rem' }}
                  onClick={() => { setEditMetaId(null); setMetaForm(emptyMeta); setMetaOk(''); setMetaErr(''); }}>
                  × Cancelar edición
                </button>
              </div>
            )}
            <div className="create-layout">
              <form className="create-form" onSubmit={handleCreateMeta}>
                <div className="field-group">
                  <label>NOMBRE DE LA META</label>
                  <input type="text" value={metaForm.nombre} required placeholder="Ej: Ventas Q3 Norte"
                    onChange={e => setMetaForm(f => ({ ...f, nombre: e.target.value }))} />
                </div>
                <div className="field-group">
                  <label>ÁREA ID</label>
                  <input type="text" value={metaForm.areaId} required placeholder="Ej: ventas-norte"
                    onChange={e => setMetaForm(f => ({ ...f, areaId: e.target.value }))} />
                </div>
                <div className="field-group">
                  <label>VALOR OBJETIVO</label>
                  <input type="number" min={0} step="any" required placeholder="Ej: 50000"
                    value={metaForm.valorObjetivo === 0 ? '' : metaForm.valorObjetivo}
                    onChange={e => setMetaForm(f => ({ ...f, valorObjetivo: e.target.value === '' ? 0 : parseFloat(e.target.value) }))} />
                </div>
                <div className="field-group">
                  <label>VALOR ACTUAL</label>
                  <input type="number" min={0} step="any" placeholder="Ej: 12000 (opcional)"
                    value={metaForm.valorActual === 0 ? '' : metaForm.valorActual}
                    onChange={e => setMetaForm(f => ({ ...f, valorActual: e.target.value === '' ? 0 : parseFloat(e.target.value) }))} />
                </div>
                <div className="field-group">
                  <label>FECHA LÍMITE</label>
                  <input type="date" value={metaForm.fechaLimite} required
                    onChange={e => setMetaForm(f => ({ ...f, fechaLimite: e.target.value }))} />
                </div>
                {metaErr && <div className="alert-error">{metaErr}</div>}
                {metaOk  && <div className="alert-success">{metaOk}</div>}
                <button type="submit" className="btn-create" disabled={metaCreating}>
                  {metaCreating
                    ? 'GUARDANDO...'
                    : editMetaId ? '✎ ACTUALIZAR META' : '+ CREAR META'}
                </button>
              </form>
              <div className="request-preview">
                <div className="preview-label">PREVIEW DEL REQUEST</div>
                <pre className="preview-code">{JSON.stringify({
                  method: editMetaId ? 'PUT' : 'POST',
                  url: editMetaId
                    ? `http://localhost:3002/api/metas/${editMetaId}`
                    : 'http://localhost:3002/api/metas',
                  body: {
                    nombre: metaForm.nombre || '…',
                    areaId: metaForm.areaId || '…',
                    valorObjetivo: metaForm.valorObjetivo,
                    valorActual: metaForm.valorActual,
                    fechaLimite: metaForm.fechaLimite || 'YYYY-MM-DD',
                  }
                }, null, 2)}</pre>
              </div>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
