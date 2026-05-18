import React from 'react';
import { SectionHeader, KpiCard } from '../DashboardComponents';
import { KpiGateway, KpiRaw, CreateKpiPayload, eliminarKpi } from '../../api';

/* ── View KPIs ── */
export function KpiListView({ gwKpis, onRefresh }: { gwKpis: any, onRefresh: () => void }) {
  return (
    <section className="content-section">
      <SectionHeader title="KPIs Consolidados" desc="GET /api/dashboard/kpis · Gateway → ms-kpis (:3001)"
        badge="Bearer Token" badgeType="auth" onRefresh={onRefresh} loading={gwKpis.loading} />
      {gwKpis.error && <div className="alert-error">{gwKpis.error}</div>}
      {gwKpis.loading && <div className="loading-state">Consultando gateway...</div>}
      <div className="kpi-grid">
        {gwKpis.data?.map((k: KpiGateway) => <KpiCard key={k.id} kpi={k} />)}
      </div>
    </section>
  );
}

export function KpiRawView({ rawKpis, onRefresh }: { rawKpis: any, onRefresh: () => void }) {
  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar KPI e historial?')) return;
    try {
      await eliminarKpi(id);
      onRefresh();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <section className="content-section">
      <SectionHeader title="KPIs Raw" desc="GET /api/kpis · Directo a ms-kpis (:3001)"
        badge="Sin Autenticación" badgeType="open" onRefresh={onRefresh} loading={rawKpis.loading} />
      {rawKpis.error && <div className="alert-error">{rawKpis.error}</div>}
      <div className="table-wrapper">
        <table className="kpi-table">
          <thead><tr><th>ID</th><th>NOMBRE</th><th>VALOR</th><th>ÁREA</th><th>FECHA</th><th>ACCIONES</th></tr></thead>
          <tbody>
            {rawKpis.data?.map((k: KpiRaw) => (
              <tr key={k.id}>
                <td className="mono" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <span title={k.id}>{k.id.slice(0, 8)}</span>
                  <button 
                    onClick={() => { navigator.clipboard.writeText(k.id); alert('ID Copiado'); }}
                    style={{padding: '2px 4px', fontSize: '0.6rem', background: 'var(--accent)', border: 'none', borderRadius: '3px', cursor: 'pointer', color: 'black'}}
                  >
                    COPY
                  </button>
                </td>
                <td>{k.nombre}</td>
                <td className="mono">{k.valor.toLocaleString('es-CL')}</td>
                <td><span className="area-tag">{k.areaId}</span></td>
                <td className="mono">{new Date(k.fechaCreacion).toLocaleString('es-CL')}</td>
                <td>
                  <button onClick={() => handleDelete(k.id)} style={{background: 'var(--red)', color: 'white', border: 'none', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer'}}>
                    ELIMINAR
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ── Create KPI ── */
export function KpiCreateForm({ form, setForm, onSubmit, creating, ok, err }: {
  form: CreateKpiPayload;
  setForm: (f: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  creating: boolean;
  ok: string;
  err: string;
}) {
  return (
    <section className="content-section">
      <SectionHeader title="Crear KPI" desc="POST /api/kpis · Directo a ms-kpis (:3001)"
        badge="Sin Autenticación" badgeType="open" />
      <div className="create-layout">
        <form className="create-form" onSubmit={onSubmit}>
          <div className="field-group">
            <label>NOMBRE DEL KPI</label>
            <input type="text" value={form.nombre} required placeholder="Ej: Ventas Retail Q2"
              onChange={e => setForm((f: any) => ({ ...f, nombre: e.target.value }))} />
          </div>
          <div className="field-group">
            <label>VALOR</label>
            <input type="number" min={0} step="any" required placeholder="Ej: 15000"
              value={form.valor === 0 ? '' : form.valor}
              onChange={e => setForm((f: any) => ({ ...f, valor: e.target.value === '' ? 0 : parseFloat(e.target.value) }))} />
          </div>
          <div className="field-group">
            <label>ÁREA ID</label>
            <input type="text" value={form.areaId} required placeholder="Ej: ventas-sur"
              onChange={e => setForm((f: any) => ({ ...f, areaId: e.target.value }))} />
          </div>
          <div className="field-group">
            <label>DESCRIPCIÓN</label>
            <textarea value={form.descripcion} placeholder="Opcional"
              onChange={e => setForm((f: any) => ({ ...f, descripcion: e.target.value }))} />
          </div>
          <div className="field-row" style={{display: 'flex', gap: '1rem'}}>
            <div className="field-group" style={{flex: 1}}>
              <label>EQUIPO RESPONSABLE (ID)</label>
              <input type="text" value={form.equipoId || ''} placeholder="Ej: equipo-ventas-sur"
                onChange={e => setForm((f: any) => ({ ...f, equipoId: e.target.value }))} />
            </div>
            <div className="field-group" style={{flex: 1}}>
              <label>RESPONSABLE (NOMBRE)</label>
              <input type="text" value={form.responsable || ''} placeholder="Ej: Juan Pérez"
                onChange={e => setForm((f: any) => ({ ...f, responsable: e.target.value }))} />
            </div>
          </div>
          <div className="field-group">
            <label>UNIDAD DE MEDICIÓN</label>
            <input type="text" value={form.unidadMedicion} required placeholder="Ej: CLP, %, Unidades"
              onChange={e => setForm((f: any) => ({ ...f, unidadMedicion: e.target.value }))} />
          </div>
          {err && <div className="alert-error">{err}</div>}
          {ok  && <div className="alert-success">{ok}</div>}
          <button type="submit" className="btn-create" disabled={creating}>
            {creating ? 'GUARDANDO...' : '+ CREAR KPI'}
          </button>
        </form>
      </div>
    </section>
  );
}
