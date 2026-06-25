import { useState, useEffect } from 'react';
import {
  getMsKpis, createKpi,
  getMsEquipos, crearEquipoDirecto,
  getMsMetas, crearMeta, actualizarMeta, eliminarMeta,
  CreateKpiPayload,
  CreateEquipoPayload,
  Meta, CreateMetaPayload, OperadorMeta,
} from '../api';

import { useAsyncData, decodeToken } from '../hooks/useDashboard';
import { KpiListView, KpiCreateForm } from '../components/sections/KpiSections';
import { EquipoListView, EquipoCreateForm } from '../components/sections/EquipoSections';
import { MetaListView, MetaCreateForm } from '../components/sections/MetaSections';
import { MetricSection } from '../components/sections/MetricSection';
import { LogsSection } from '../components/sections/LogsSection';

type Tab =
  | 'kpis' | 'create-kpi'
  | 'equipos' | 'crear-equipo'
  | 'metas' | 'crear-meta'
  | 'metricas' | 'logs';

interface Props { token: string; onLogout: () => void; }

export function DashboardPage({ token, onLogout }: Props) {
  const user = decodeToken(token);
  const initialTab: Tab = user.role === 'vendedor' ? 'metricas' : 'metricas';
  const [tab, setTab] = useState<Tab>(initialTab);

  // Datos
  const rawKpis  = useAsyncData(getMsKpis, []);
  const rawEq    = useAsyncData(getMsEquipos, []);
  const metas    = useAsyncData(getMsMetas, []);

  // Forms
  const emptyKpi: CreateKpiPayload = { nombre: '', valor: 0, areaId: '', descripcion: '', unidadMedicion: '' };
  const [kpiForm, setKpiForm]   = useState(emptyKpi);
  const [kpiState, setKpiState] = useState({ creating: false, ok: '', err: '' });

  const emptyEq: CreateEquipoPayload = { nombre: '', lider: '', areaId: '', cantidadIntegrantes: 0 };
  const [eqForm, setEqForm]     = useState(emptyEq);
  const [eqState, setEqState]   = useState({ creating: false, ok: '', err: '' });

  const emptyMeta: CreateMetaPayload = {
    nombre: '', areaId: '', indicadorId: '', periodo: '',
    fechaInicio: '', fechaFin: '', valorObjetivo: 0,
    operador: '>=' as OperadorMeta, unidad: '', descripcionObjetivo: ''
  };
  const [metaForm, setMetaForm]     = useState(emptyMeta);
  const [editMetaId, setEditMetaId] = useState<string | null>(null);
  const [metaState, setMetaState]   = useState({ creating: false, ok: '', err: '' });

  // Auto-cargar al cambiar de tab
  useEffect(() => {
    const loaders: Partial<Record<Tab, () => void>> = {
      'kpis':    rawKpis.load,
      'equipos': rawEq.load,
      'metas':   metas.load,
      'crear-meta': rawKpis.load, // necesita la lista de KPIs para el selector
    };
    loaders[tab]?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  /* ── Handlers ── */
  const handleCreateKpi = async (e: React.FormEvent) => {
    e.preventDefault();
    setKpiState({ creating: true, ok: '', err: '' });
    try {
      const k = await createKpi(kpiForm, token);
      setKpiState({ creating: false, ok: `✓ KPI "${k.nombre}" creado — ID: ${k.id}`, err: '' });
      setKpiForm(emptyKpi);
      rawKpis.load();
    } catch (e: any) { setKpiState({ creating: false, ok: '', err: e.message }); }
  };

  const handleCreateEquipo = async (e: React.FormEvent) => {
    e.preventDefault();
    setEqState({ creating: true, ok: '', err: '' });
    try {
      const eq = await crearEquipoDirecto(eqForm, token);
      setEqState({ creating: false, ok: `✓ Equipo "${eq.nombre}" creado`, err: '' });
      setEqForm(emptyEq);
      rawEq.load();
    } catch (e: any) { setEqState({ creating: false, ok: '', err: e.message }); }
  };

  const handleCreateMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    setMetaState({ creating: true, ok: '', err: '' });
    try {
      if (editMetaId) await actualizarMeta(editMetaId, metaForm);
      else await crearMeta(metaForm);
      setMetaState({ creating: false, ok: `✓ Meta ${editMetaId ? 'actualizada' : 'creada'} correctamente`, err: '' });
      if (!editMetaId) setMetaForm(emptyMeta);
      metas.load();
    } catch (e: any) { setMetaState({ creating: false, ok: '', err: e.message }); }
  };

  const handleEditarMeta = (meta: Meta) => {
    setMetaForm({
      nombre: meta.nombre, areaId: meta.areaId,
      equipoId: meta.equipoId || '', indicadorId: meta.indicadorId || '',
      periodo: meta.periodo, fechaInicio: meta.fechaInicio, fechaFin: meta.fechaFin,
      valorObjetivo: meta.valorObjetivo, operador: meta.operador,
      unidad: meta.unidad, descripcionObjetivo: meta.descripcionObjetivo || ''
    });
    setEditMetaId(meta.id);
    setTab('crear-meta');
  };

  const handleEliminarMeta = async (id: string) => {
    if (!confirm('¿Eliminar esta meta?')) return;
    try {
      await eliminarMeta(id);
      metas.setData(prev => prev ? prev.filter(m => m.id !== id) : prev);
    } catch (e: any) { alert(e.message); }
  };

  const goTab = (t: Tab) => {
    // Si estaba editando meta y navega a crear, resetea
    if (t === 'crear-meta') { setEditMetaId(null); setMetaForm(emptyMeta); setMetaState({ creating: false, ok: '', err: '' }); }
    setTab(t);
  };

  /* ── Nav ── */
  const navGroups = [
    {
      label: 'KPIs',
      items: [
        { id: 'kpis' as Tab,        icon: '◈', label: 'Ver KPIs',   sub: 'GET :3001 · Sin auth',  roles: ['jefe', 'gerente'] },
        { id: 'create-kpi' as Tab,  icon: '◎', label: 'Crear KPI',  sub: 'POST :3001 · Sin auth', roles: ['jefe', 'gerente'] },
      ]
    },
    {
      label: 'EQUIPOS',
      items: [
        { id: 'equipos' as Tab,      icon: '◈', label: 'Ver Equipos',   sub: 'GET :3003 · Sin auth',  roles: ['jefe', 'gerente'] },
        { id: 'crear-equipo' as Tab, icon: '◎', label: 'Crear Equipo',  sub: 'POST :3003 · Sin auth', roles: ['jefe', 'gerente'] },
      ]
    },
    {
      label: 'METAS',
      items: [
        { id: 'metas' as Tab,      icon: '◈', label: 'Ver Metas',    sub: 'GET :3002 · Sin auth',  roles: ['jefe', 'gerente'] },
        { id: 'crear-meta' as Tab, icon: '◎', label: 'Crear Meta',   sub: 'POST :3002 · Sin auth', roles: ['jefe', 'gerente'] },
      ]
    },
    {
      label: 'GOBERNANZA',
      items: [
        { id: 'metricas' as Tab, icon: '📊', label: 'Dashboard', sub: 'Vista consolidada',    roles: ['jefe', 'gerente', 'vendedor'] },
        { id: 'logs' as Tab,     icon: '📜', label: 'Auditoría', sub: 'Logs del sistema',     roles: ['jefe'] },
      ]
    }
  ];

  const filtered = navGroups
    .map(g => ({ ...g, items: g.items.filter(i => i.roles.includes(user.role)) }))
    .filter(g => g.items.length > 0);

  return (
    <div className="dash-root">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-symbol">▲</span>
          <div><div className="logo-title">CORDILLERA</div><div className="logo-sub">Monitoreo de Desempeño</div></div>
        </div>

        <nav className="sidebar-nav">
          {filtered.map(group => (
            <div key={group.label}>
              <div className="nav-section-label">{group.label}</div>
              {group.items.map(n => (
                <button
                  key={n.id}
                  className={`nav-item ${tab === n.id ? 'active' : ''}`}
                  onClick={() => goTab(n.id)}
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

        {/* Microservicios BFF status */}
        <div style={{ padding: '0.75rem', margin: '0 0.5rem', background: 'rgba(0,240,255,0.04)', border: '1px solid rgba(0,240,255,0.1)', borderRadius: 8, fontSize: '0.6rem', color: 'var(--text-muted)' }}>
          <div style={{ color: 'var(--accent)', fontWeight: 700, marginBottom: '0.4rem', letterSpacing: 1 }}>MICROSERVICIOS BFF</div>
          {[['ms-kpis', '3001'], ['ms-metas', '3002'], ['ms-equipos', '3003'], ['api-gateway', '3000']].map(([name, port]) => (
            <div key={name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span>{name}</span>
              <span style={{ color: 'var(--teal)' }}>:{port} ✓</span>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user.email[0].toUpperCase()}</div>
            <div>
              <div className="user-email">{user.email}</div>
              <div className="user-role">{user.role}</div>
            </div>
          </div>
          <button className="btn-logout" onClick={onLogout}>CERRAR SESIÓN</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="dash-main">
        {tab === 'kpis' && (
          <KpiListView rawKpis={rawKpis} onRefresh={rawKpis.load} onCrear={() => setTab('create-kpi')} />
        )}
        {tab === 'create-kpi' && (
          <KpiCreateForm form={kpiForm} setForm={setKpiForm} onSubmit={handleCreateKpi}
            creating={kpiState.creating} ok={kpiState.ok} err={kpiState.err} />
        )}

        {tab === 'equipos' && (
          <EquipoListView gwEq={rawEq} onRefresh={rawEq.load} onCrear={() => setTab('crear-equipo')} />
        )}
        {tab === 'crear-equipo' && (
          <EquipoCreateForm form={eqForm} setForm={setEqForm} onSubmit={handleCreateEquipo}
            creating={eqState.creating} ok={eqState.ok} err={eqState.err} />
        )}

        {tab === 'metas' && (
          <MetaListView metas={metas} onRefresh={metas.load}
            onEditar={handleEditarMeta} onEliminar={handleEliminarMeta}
            onCrear={() => goTab('crear-meta')} />
        )}
        {tab === 'crear-meta' && (
          <MetaCreateForm
            kpis={rawKpis.data}
            form={metaForm} setForm={setMetaForm}
            onSubmit={handleCreateMeta}
            creating={metaState.creating} ok={metaState.ok} err={metaState.err}
            editMetaId={editMetaId}
            onCancel={() => { setEditMetaId(null); setMetaForm(emptyMeta); setTab('metas'); }}
          />
        )}

        {tab === 'metricas' && <MetricSection token={token} />}
        {tab === 'logs' && <LogsSection token={token} />}
      </main>
    </div>
  );
}
