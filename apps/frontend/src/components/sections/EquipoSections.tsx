import React from 'react';
import { SectionHeader, EquipoCard } from '../DashboardComponents';
import { Equipo, CreateEquipoPayload } from '../../api';

export function EquipoListView({ gwEq, onRefresh }: { gwEq: any, onRefresh: () => void }) {
  return (
    <section className="content-section">
      <SectionHeader title="Equipos" desc="GET /api/dashboard/equipos · Gateway → ms-equipos (:3003)"
        badge="Bearer Token" badgeType="auth" onRefresh={onRefresh} loading={gwEq.loading} />
      <div className="kpi-grid">
        {gwEq.data?.map((eq: Equipo) => <EquipoCard key={eq.id} equipo={eq} />)}
      </div>
    </section>
  );
}

export function EquipoCreateForm({ form, setForm, onSubmit, creating, ok, err }: {
  form: CreateEquipoPayload;
  setForm: (f: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  creating: boolean;
  ok: string;
  err: string;
}) {
  return (
    <section className="content-section">
      <SectionHeader title="Crear Equipo" desc="POST /api/equipos · ms-equipos (:3003)"
        badge="Sin Autenticación" badgeType="open" />
      <form className="create-form" onSubmit={onSubmit}>
        <div className="field-group">
          <label>NOMBRE</label>
          <input type="text" value={form.nombre} required onChange={e => setForm((f: any) => ({ ...f, nombre: e.target.value }))} />
        </div>
        <div className="field-group">
          <label>LÍDER</label>
          <input type="text" value={form.lider} required onChange={e => setForm((f: any) => ({ ...f, lider: e.target.value }))} />
        </div>
        <div className="field-group">
          <label>ID ÁREA</label>
          <input type="text" value={form.areaId} required onChange={e => setForm((f: any) => ({ ...f, areaId: e.target.value }))} />
        </div>
        <div className="field-group">
          <label>INTEGRANTES</label>
          <input type="number" value={form.cantidadIntegrantes} onChange={e => setForm((f: any) => ({ ...f, cantidadIntegrantes: parseInt(e.target.value) || 0 }))} />
        </div>
        {err && <div className="alert-error">{err}</div>}
        {ok  && <div className="alert-success">{ok}</div>}
        <button type="submit" className="btn-create" disabled={creating}>GUARDAR EQUIPO</button>
      </form>
    </section>
  );
}

export function EquipoRawView({ rawEq, onRefresh }: { rawEq: any, onRefresh: () => void }) {
  return (
    <section className="content-section">
      <SectionHeader title="Equipos Raw" desc="GET /api/equipos · Directo a ms-equipos (:3003)"
        badge="Sin Autenticación" badgeType="open" onRefresh={onRefresh} loading={rawEq.loading} />
      {rawEq.error && <div className="alert-error">{rawEq.error}</div>}
      <div className="table-wrapper">
        <table className="kpi-table">
          <thead><tr><th>ID</th><th>NOMBRE</th><th>LÍDER</th><th>ÁREA</th><th>INTEGRANTES</th><th>FECHA</th></tr></thead>
          <tbody>
            {rawEq.data?.map((eq: Equipo) => (
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
    </section>
  );
}
