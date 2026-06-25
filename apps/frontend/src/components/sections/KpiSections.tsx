import React from 'react';
import { SectionHeader } from '../DashboardComponents';
import { KpiRaw, CreateKpiPayload, eliminarKpi } from '../../api';

/* ── Vista unificada de KPIs ─────────────────────────────────── */
export function KpiListView({ rawKpis, onRefresh, onCrear }: {
  rawKpis: any;
  onRefresh: () => void;
  onCrear: () => void;
}) {
  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este KPI y todo su historial?')) return;
    try { await eliminarKpi(id); onRefresh(); }
    catch (e: any) { alert(e.message); }
  };

  return (
    <section className="content-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <SectionHeader title="KPIs" desc="GET /api/kpis · ms-kpis (:3001)"
          badge="Sin Autenticación" badgeType="open" onRefresh={onRefresh} loading={rawKpis.loading} />
        <button className="btn-create" style={{ marginTop: 0, padding: '0.5rem 1rem' }} onClick={onCrear}>+ CREAR KPI</button>
      </div>

      {rawKpis.error && <div className="alert-error" style={{ marginBottom: '1rem' }}>{rawKpis.error}</div>}

      <div className="table-wrapper">
        <table className="kpi-table">
          <thead>
            <tr>
              <th>NOMBRE</th>
              <th>ÁREA</th>
              <th>VALOR ACTUAL</th>
              <th>UNIDAD</th>
              <th>RESPONSABLE</th>
              <th>FECHA CREACIÓN</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {rawKpis.loading && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Cargando…</td></tr>
            )}
            {!rawKpis.loading && rawKpis.data?.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No hay KPIs registrados. Crea el primero.</td></tr>
            )}
            {rawKpis.data?.map((k: KpiRaw) => (
              <tr key={k.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{k.nombre}</div>
                  {k.descripcion && <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{k.descripcion}</div>}
                </td>
                <td><span className="area-tag">{k.areaId}</span></td>
                <td className="mono" style={{ fontWeight: 700, fontSize: '1rem' }}>{k.valor.toLocaleString('es-CL')}</td>
                <td><span className="team-tag">{k.unidadMedicion}</span></td>
                <td style={{ fontSize: '0.75rem' }}>{k.responsable ?? '—'}</td>
                <td className="mono" style={{ fontSize: '0.65rem' }}>{new Date(k.fechaCreacion).toLocaleDateString('es-CL')}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      onClick={() => { navigator.clipboard.writeText(k.id); }}
                      title="Copiar ID"
                      style={{ padding: '3px 7px', fontSize: '0.6rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer', color: 'var(--text-muted)' }}
                    >ID</button>
                    <button
                      onClick={() => handleDelete(k.id)}
                      style={{ padding: '3px 7px', fontSize: '0.6rem', background: 'var(--red)', border: 'none', borderRadius: 4, cursor: 'pointer', color: '#fff', fontWeight: 700 }}
                    >✕</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ── Formulario crear KPI ────────────────────────────────────── */
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
      <SectionHeader title="Crear KPI" desc="POST /api/kpis · ms-kpis (:3001)"
        badge="Sin Autenticación" badgeType="open" />
      <form className="create-form" onSubmit={onSubmit}>
        <div className="field-group">
          <label>NOMBRE DEL KPI</label>
          <input type="text" value={form.nombre} required placeholder="Ej: Producción Diaria de Cobre"
            onChange={e => setForm((f: any) => ({ ...f, nombre: e.target.value }))} />
        </div>
        <div className="field-row" style={{ display: 'flex', gap: '1rem' }}>
          <div className="field-group" style={{ flex: 2 }}>
            <label>ÁREA ID</label>
            <input type="text" value={form.areaId} required placeholder="Ej: operaciones-mineras"
              onChange={e => setForm((f: any) => ({ ...f, areaId: e.target.value }))} />
          </div>
          <div className="field-group" style={{ flex: 1 }}>
            <label>VALOR INICIAL</label>
            <input type="number" min={0} step="any" required placeholder="0"
              value={form.valor === 0 ? '' : form.valor}
              onChange={e => setForm((f: any) => ({ ...f, valor: e.target.value === '' ? 0 : parseFloat(e.target.value) }))} />
          </div>
          <div className="field-group" style={{ flex: 1 }}>
            <label>UNIDAD</label>
            <input type="text" value={form.unidadMedicion} required placeholder="Ej: Tons"
              onChange={e => setForm((f: any) => ({ ...f, unidadMedicion: e.target.value }))} />
          </div>
        </div>
        <div className="field-group">
          <label>DESCRIPCIÓN</label>
          <textarea value={form.descripcion} placeholder="Descripción del indicador (opcional)"
            onChange={e => setForm((f: any) => ({ ...f, descripcion: e.target.value }))}
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '0.75rem', color: '#fff', width: '100%', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
        </div>
        <div className="field-row" style={{ display: 'flex', gap: '1rem' }}>
          <div className="field-group" style={{ flex: 1 }}>
            <label>EQUIPO (ID)</label>
            <input type="text" value={form.equipoId || ''} placeholder="UUID del equipo (opcional)"
              onChange={e => setForm((f: any) => ({ ...f, equipoId: e.target.value }))} />
          </div>
          <div className="field-group" style={{ flex: 1 }}>
            <label>RESPONSABLE</label>
            <input type="text" value={form.responsable || ''} placeholder="Ej: Juan Pérez"
              onChange={e => setForm((f: any) => ({ ...f, responsable: e.target.value }))} />
          </div>
        </div>
        {err && <div className="alert-error">{err}</div>}
        {ok && <div className="alert-success">{ok}</div>}
        <button type="submit" className="btn-create" disabled={creating}>
          {creating ? 'GUARDANDO...' : '+ CREAR KPI'}
        </button>
      </form>
    </section>
  );
}
