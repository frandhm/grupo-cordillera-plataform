import { useState, useEffect } from 'react';
import {
  getGatewayKpis, getMsKpis, createKpi,
  getGatewayEquipos, getMsEquipos, crearEquipoDirecto,
  getMsMetas, crearMeta, actualizarMeta, eliminarMeta,
  getResumenConsolidado,
  CreateKpiPayload,
  CreateEquipoPayload,
  Meta, CreateMetaPayload,
} from '../api';

import { useAsyncData, decodeToken } from '../hooks/useDashboard';
import { KpiListView, KpiRawView, KpiCreateForm } from '../components/sections/KpiSections';
import { EquipoListView, EquipoCreateForm, EquipoRawView } from '../components/sections/EquipoSections';
import { MetaListView, MetaCreateForm } from '../components/sections/MetaSections';
import { MetricSection } from '../components/sections/MetricSection';
import { LogsSection } from '../components/sections/LogsSection';

type Tab =
  | 'gateway-kpis' | 'raw-kpis' | 'create-kpi'
  | 'gateway-eq' | 'crear-equipo' | 'raw-eq'
  | 'metas' | 'crear-meta' | 'editar-meta'
  | 'metricas' | 'logs';

interface Props {
  token: string;
  onLogout: () => void;
}

export function DashboardPage({ token, onLogout }: Props) {
  const user = decodeToken(token);
  const initialTab: Tab = user.role === 'vendedor' ? 'metricas' : 'gateway-kpis';
  const [tab, setTab] = useState<Tab>(initialTab);

  /* KPIs */
  const gwKpis = useAsyncData(() => getGatewayKpis(token), [token]);
  const rawKpis = useAsyncData(getMsKpis, []);
  const gwEq = useAsyncData(() => getGatewayEquipos(token), [token]);
  const rawEq = useAsyncData(getMsEquipos, []);
  const metas = useAsyncData(getMsMetas, []);

  /* Forms State */
  const emptyKpi: CreateKpiPayload = { nombre: '', valor: 0, areaId: '', descripcion: '', unidadMedicion: '' };
  const [kpiForm, setKpiForm] = useState(emptyKpi);
  const [kpiState, setKpiState] = useState({ creating: false, ok: '', err: '' });

  const emptyEq: CreateEquipoPayload = { nombre: '', lider: '', areaId: '', cantidadIntegrantes: 0 };
  const [eqForm, setEqForm] = useState(emptyEq);
  const [eqState, setEqState] = useState({ creating: false, ok: '', err: '' });

  const emptyMeta: CreateMetaPayload = { nombre: '', areaId: '', indicadorId: '', valorObjetivo: 0, valorActual: 0, fechaLimite: '' };
  const [metaForm, setMetaForm] = useState(emptyMeta);
  const [editMetaId, setEditMetaId] = useState<string | null>(null);
  const [metaState, setMetaState] = useState({ creating: false, ok: '', err: '' });

  /* Auto-load */
  useEffect(() => {
    const loaders: Record<string, () => void> = {
      'gateway-kpis': gwKpis.load, 'raw-kpis': rawKpis.load,
      'gateway-eq': gwEq.load, 'raw-eq': rawEq.load,
      'metas': metas.load
    };
    if (loaders[tab]) loaders[tab]();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  /* Handlers */
  const handleCreateKpi = async (e: React.FormEvent) => {
    e.preventDefault();
    setKpiState({ creating: true, ok: '', err: '' });
    try {
      const k = await createKpi(kpiForm, token);
      setKpiState({ creating: false, ok: `✓ KPI creado — ID: ${k.id}`, err: '' });
      setKpiForm(emptyKpi);
    } catch (e: any) { setKpiState({ creating: false, ok: '', err: e.message }); }
  };

  const handleCreateEquipo = async (e: React.FormEvent) => {
    e.preventDefault();
    setEqState({ creating: true, ok: '', err: '' });
    try {
      const eq = await crearEquipoDirecto(eqForm, token);
      setEqState({ creating: false, ok: `✓ Equipo "${eq.nombre}" creado`, err: '' });
      setEqForm(emptyEq);
    } catch (e: any) { setEqState({ creating: false, ok: '', err: e.message }); }
  };

  const handleCreateMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    setMetaState({ creating: true, ok: '', err: '' });
    try {
      if (editMetaId) await actualizarMeta(editMetaId, metaForm);
      else await crearMeta(metaForm);
      setMetaState({ creating: false, ok: `✓ Meta ${editMetaId ? 'actualizada' : 'creada'}`, err: '' });
      if (!editMetaId) setMetaForm(emptyMeta);
      metas.load();
    } catch (e: any) { setMetaState({ creating: false, ok: '', err: e.message }); }
  };

  const handleEditarMeta = (meta: Meta) => {
    setMetaForm({
      nombre: meta.nombre,
      areaId: meta.areaId,
      indicadorId: meta.indicadorId || '',
      valorObjetivo: meta.valorObjetivo,
      valorActual: meta.valorActual,
      fechaLimite: meta.fechaLimite
    });
    setEditMetaId(meta.id);
    setTab('crear-meta');
  };

  const handleEliminarMeta = async (id: string) => {
    if (!confirm('¿Eliminar meta?')) return;
    try {
      await eliminarMeta(id);
      metas.setData(prev => prev ? prev.filter(m => m.id !== id) : prev);
    } catch (e: any) { alert(e.message); }
  };

  /* ── Navigation ── */
  interface NavItem { id: Tab; icon: string; label: string; sub: string; roles: string[]; }
  interface NavGroup { label: string; items: NavItem[]; }

  const navGroups: NavGroup[] = [
    {
      label: 'KPIs',
      items: [
        { id: 'gateway-kpis', icon: '◈', label: 'KPIs Gateway', sub: 'GET :3000 · 🔐 JWT', roles: ['jefe', 'gerente'] },
        { id: 'raw-kpis', icon: '◉', label: 'KPIs Raw', sub: 'GET :3001 · Sin auth', roles: ['jefe'] },
        { id: 'create-kpi', icon: '◎', label: 'Crear KPI', sub: 'POST :3001 · Sin auth', roles: ['jefe', 'gerente'] },
      ]
    },
    {
      label: 'EQUIPOS',
      items: [
        { id: 'gateway-eq', icon: '◈', label: 'Equipos Gateway', sub: 'GET :3000 · 🔐 JWT', roles: ['jefe', 'gerente'] },
        { id: 'crear-equipo', icon: '◎', label: 'Crear Equipo', sub: 'POST :3003 · Sin auth', roles: ['jefe', 'gerente'] },
        { id: 'raw-eq', icon: '◉', label: 'Equipos Raw', sub: 'GET :3003 · Sin auth', roles: ['jefe'] },
      ]
    },
    {
      label: 'METAS',
      items: [
        { id: 'metas', icon: '◈', label: 'Ver Metas', sub: 'GET :3002 · Sin auth', roles: ['jefe'] },
        { id: 'crear-meta', icon: '◎', label: editMetaId ? 'Editando Meta' : 'Crear Meta', sub: ':3002 · Sin auth', roles: ['jefe'] },
      ]
    },
    {
      label: 'SISTEMA & AUDITORÍA',
      items: [
        { id: 'metricas', icon: '📊', label: 'Dashboard & Métricas', sub: 'Vista Consolidada', roles: ['jefe', 'gerente', 'vendedor'] },
        { id: 'logs', icon: '📜', label: 'Logs del Sistema', sub: 'Auditoría Jefe', roles: ['jefe'] },
      ]
    }
  ];

  const filteredNav = navGroups.map(g => ({ ...g, items: g.items.filter(i => i.roles.includes(user.role)) })).filter(g => g.items.length > 0);

  return (
    <div className="dash-root">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-symbol">▲</span>
          <div><div className="logo-title">CORDILLERA</div><div className="logo-sub">Testing Hub</div></div>
        </div>
        <nav className="sidebar-nav">
          {filteredNav.map(group => (
            <div key={group.label}>
              <div className="nav-section-label">{group.label}</div>
              {group.items.map(n => (
                <button key={n.id} className={`nav-item ${tab === n.id ? 'active' : ''}`}
                  onClick={() => {
                    setTab(n.id);
                    if (n.id === 'crear-meta' && !editMetaId) {
                      setMetaForm(emptyMeta);
                    }
                    if (n.id === 'crear-meta' && editMetaId) {
                      // Si pulsa "Crear" estando en edición, reseteamos para crear una nueva
                      setEditMetaId(null);
                      setMetaForm(emptyMeta);
                    }
                  }}>
                  <span className="nav-icon">{n.icon}</span>
                  <span><div className="nav-label">{n.label}</div><div className="nav-sub">{n.sub}</div></span>
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user.email[0].toUpperCase()}</div>
            <div><div className="user-email">{user.email}</div><div className="user-role">{user.role}</div></div>
          </div>
          <button className="btn-logout" onClick={onLogout}>CERRAR SESIÓN</button>
        </div>
      </aside>

      <main className="dash-main">
        {tab === 'gateway-kpis' && <KpiListView gwKpis={gwKpis} onRefresh={gwKpis.load} />}
        {tab === 'raw-kpis' && <KpiRawView rawKpis={rawKpis} onRefresh={rawKpis.load} />}
        {tab === 'create-kpi' && <KpiCreateForm form={kpiForm} setForm={setKpiForm} onSubmit={handleCreateKpi} creating={kpiState.creating} ok={kpiState.ok} err={kpiState.err} />}

        {tab === 'gateway-eq' && <EquipoListView gwEq={gwEq} onRefresh={gwEq.load} />}
        {tab === 'crear-equipo' && <EquipoCreateForm form={eqForm} setForm={setEqForm} onSubmit={handleCreateEquipo} creating={eqState.creating} ok={eqState.ok} err={eqState.err} />}
        {tab === 'raw-eq' && <EquipoRawView rawEq={rawEq} onRefresh={rawEq.load} />}

        {tab === 'metas' && <MetaListView metas={metas} onRefresh={metas.load} onEditar={handleEditarMeta} onEliminar={handleEliminarMeta} onCrear={() => setTab('crear-meta')} />}
        {tab === 'crear-meta' && <MetaCreateForm kpis={rawKpis.data} form={metaForm} setForm={setMetaForm} onSubmit={handleCreateMeta} creating={metaState.creating} ok={metaState.ok} err={metaState.err} editMetaId={editMetaId} onCancel={() => { setEditMetaId(null); setMetaForm(emptyMeta); setTab('metas'); }} />}

        {tab === 'metricas' && <MetricSection token={token} />}
        {tab === 'logs' && <LogsSection token={token} />}
      </main>
    </div>
  );
}
