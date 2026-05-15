import { useState, useEffect } from 'react';
import {
  getGatewayKpis, getMsKpis, createKpi,
  getGatewayEquipos, getMsEquipos, crearEquipoDirecto,
  getMsMetas, crearMeta, actualizarMeta, eliminarMeta,
  getResumenConsolidado,
  CreateKpiPayload,
  Equipo, CreateEquipoPayload,
  Meta, CreateMetaPayload,
} from '../api';

import { useAsyncData, decodeToken } from '../hooks/useDashboard';
import { SectionHeader, KpiCard, EquipoCard, MetaCard } from '../components/DashboardComponents';

type Tab =
  | 'gateway-kpis' | 'raw-kpis'    | 'create-kpi'
  | 'gateway-eq'   | 'crear-equipo' | 'raw-eq'
  | 'metas'        | 'crear-meta'   | 'editar-meta'
  | 'resumen';

interface Props { token: string; onLogout: () => void; }

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
  const resumen = useAsyncData(() => getResumenConsolidado(token), [token]);

  /* Create KPI form */
  const emptyKpi: CreateKpiPayload = { 
    nombre: '', 
    valor: 0, 
    areaId: '', 
    descripcion: '', 
    unidadMedicion: '' 
  };
  const [kpiForm, setKpiForm]         = useState(emptyKpi);
  const [kpiCreating, setKpiCreating] = useState(false);
  const [kpiOk, setKpiOk]             = useState('');
  const [kpiErr, setKpiErr]           = useState('');

  /* Create Equipo form */
  const emptyEq: CreateEquipoPayload = { nombre: '', lider: '', areaId: '', cantidadIntegrantes: 0 };
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
    if (tab === 'resumen')      resumen.load();
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
    {
      label: 'BFF (AGREGACIÓN)',
      items: [
        { id: 'resumen' as Tab, icon: '⚡', label: 'Resumen BFF', sub: 'GET :3000 · KPIs + Metas' },
      ],
    },
  ];

  return (
    <div className="dash-root">
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

      <main className="dash-main">
        {tab === 'gateway-kpis' && (
          <section className="content-section">
            <SectionHeader title="KPIs Consolidados" desc="GET /api/dashboard/kpis · Gateway → ms-kpis (:3001)"
              badge="Bearer Token" badgeType="auth" onRefresh={gwKpis.load} loading={gwKpis.loading} />
            {gwKpis.error && <div className="alert-error">{gwKpis.error}</div>}
            {gwKpis.loading && <div className="loading-state">Consultando gateway...</div>}
            <div className="kpi-grid">
              {gwKpis.data?.map(k => <KpiCard key={k.id} kpi={k} />)}
            </div>
          </section>
        )}

        {tab === 'raw-kpis' && (
          <section className="content-section">
            <SectionHeader title="KPIs Raw" desc="GET /api/kpis · Directo a ms-kpis (:3001)"
              badge="Sin Autenticación" badgeType="open" onRefresh={rawKpis.load} loading={rawKpis.loading} />
            {rawKpis.error && <div className="alert-error">{rawKpis.error}</div>}
            <div className="table-wrapper">
              <table className="kpi-table">
                <thead><tr><th>ID</th><th>NOMBRE</th><th>VALOR</th><th>ÁREA</th><th>FECHA</th></tr></thead>
                <tbody>
                  {rawKpis.data?.map(k => (
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
          </section>
        )}

        {tab === 'create-kpi' && (
          <section className="content-section">
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
                {kpiOk  && <div className="alert-success">{kpiOk}</div>}
                <button type="submit" className="btn-create" disabled={kpiCreating}>
                  {kpiCreating ? 'GUARDANDO...' : '+ CREAR KPI'}
                </button>
              </form>
            </div>
          </section>
        )}

        {tab === 'gateway-eq' && (
          <section className="content-section">
            <SectionHeader title="Equipos" desc="GET /api/dashboard/equipos · Gateway → ms-equipos (:3003)"
              badge="Bearer Token" badgeType="auth" onRefresh={gwEq.load} loading={gwEq.loading} />
            <div className="kpi-grid">
              {gwEq.data?.map(eq => <EquipoCard key={eq.id} equipo={eq} />)}
            </div>
          </section>
        )}

        {tab === 'crear-equipo' && (
          <section className="content-section">
            <SectionHeader title="Crear Equipo" desc="POST /api/equipos · ms-equipos (:3003)"
              badge="Sin Autenticación" badgeType="open" />
            <form className="create-form" onSubmit={handleCreateEquipo}>
              <div className="field-group"><label>NOMBRE</label><input type="text" value={eqForm.nombre} required onChange={e => setEqForm(f => ({ ...f, nombre: e.target.value }))} /></div>
              <div className="field-group"><label>LÍDER</label><input type="text" value={eqForm.lider} required onChange={e => setEqForm(f => ({ ...f, lider: e.target.value }))} /></div>
              <div className="field-group"><label>ID ÁREA</label><input type="text" value={eqForm.areaId} required onChange={e => setEqForm(f => ({ ...f, areaId: e.target.value }))} /></div>
              <div className="field-group"><label>INTEGRANTES</label><input type="number" value={eqForm.cantidadIntegrantes} onChange={e => setEqForm(f => ({ ...f, cantidadIntegrantes: parseInt(e.target.value) || 0 }))} /></div>
              {eqErr && <div className="alert-error">{eqErr}</div>}
              {eqOk  && <div className="alert-success">{eqOk}</div>}
              <button type="submit" className="btn-create" disabled={eqCreating}>GUARDAR EQUIPO</button>
            </form>
          </section>
        )}

        {tab === 'metas' && (
          <section className="content-section">
            <SectionHeader title="Metas" desc="GET /api/metas · ms-metas (:3002)"
              badge="Sin Autenticación" badgeType="open" onRefresh={metas.load} loading={metas.loading} />
            <div className="kpi-grid">
              {metas.data?.map(m => <MetaCard key={m.id} meta={m} onEditar={handleEditarMeta} onEliminar={handleEliminarMeta} />)}
            </div>
          </section>
        )}

        {tab === 'resumen' && (
          <section className="content-section">
            <SectionHeader title="Resumen BFF" desc="Orquestación KPIs + Metas"
              badge="Bearer Token" badgeType="auth" onRefresh={resumen.load} loading={resumen.loading} />
            <div className="table-wrapper">
              <table className="kpi-table">
                <thead><tr><th>KPI</th><th>ÁREA</th><th>VALOR</th><th>META</th><th>CUMPLIMIENTO</th><th>ESTADO</th></tr></thead>
                <tbody>
                  {resumen.data?.map((item: any) => (
                    <tr key={item.id}>
                      <td><strong>{item.nombre}</strong><div className="nav-sub">{item.unidadMedicion}</div></td>
                      <td><span className="area-tag">{item.areaId}</span></td>
                      <td className="mono">{item.valor.toLocaleString('es-CL')}</td>
                      <td>{item.meta ? item.meta.nombre : 'Sin Meta'}</td>
                      <td className="mono" style={{fontWeight:'bold'}}>{item.cumplimientoCalculado}</td>
                      <td>{item.meta?.estado || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
