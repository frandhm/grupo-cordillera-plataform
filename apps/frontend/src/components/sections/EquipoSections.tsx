import React from 'react';
import { SectionHeader } from '../DashboardComponents';
import { Equipo, CreateEquipoPayload } from '../../api';

/* ── Vista unificada de Equipos ──────────────────────────────── */
export function EquipoListView({ gwEq, onRefresh, onCrear }: {
  gwEq: any;
  onRefresh: () => void;
  onCrear: () => void;
}) {
  return (
    <section className="content-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <SectionHeader title="Equipos" desc="GET /api/equipos · ms-equipos (:3003)"
          badge="Sin Autenticación" badgeType="open" onRefresh={onRefresh} loading={gwEq.loading} />
        <button className="btn-create" style={{ marginTop: 0, padding: '0.5rem 1rem' }} onClick={onCrear}>+ CREAR EQUIPO</button>
      </div>

      {gwEq.error && <div className="alert-error" style={{ marginBottom: '1rem' }}>{gwEq.error}</div>}

      <div className="table-wrapper">
        <table className="kpi-table">
          <thead>
            <tr>
              <th>EQUIPO</th>
              <th>LÍDER</th>
              <th>ÁREA</th>
              <th>INTEGRANTES</th>
              <th>FECHA CREACIÓN</th>
              <th>ID</th>
            </tr>
          </thead>
          <tbody>
            {gwEq.loading && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Cargando…</td></tr>
            )}
            {!gwEq.loading && gwEq.data?.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No hay equipos registrados. Crea el primero.</td></tr>
            )}
            {gwEq.data?.map((eq: Equipo) => (
              <tr key={eq.id}>
                <td>
                  <span style={{ fontWeight: 600 }}>{eq.nombre}</span>
                </td>
                <td style={{ fontSize: '0.8rem' }}>
                  <span>👤 {eq.lider}</span>
                </td>
                <td><span className="area-tag">{eq.area?.nombre ?? eq.areaId}</span></td>
                <td className="mono" style={{ textAlign: 'center', fontWeight: 700 }}>
                  {eq.cantidadIntegrantes}
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 4 }}>miembros</span>
                </td>
                <td className="mono" style={{ fontSize: '0.7rem' }}>{new Date(eq.fechaCreacion).toLocaleDateString('es-CL')}</td>
                <td>
                  <button
                    onClick={() => navigator.clipboard.writeText(eq.id)}
                    title="Copiar UUID"
                    style={{ padding: '3px 7px', fontSize: '0.6rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                  >
                    {eq.id.slice(0, 8)}…
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

/* ── Formulario crear Equipo ─────────────────────────────────── */
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
        <div className="field-row" style={{ display: 'flex', gap: '1rem' }}>
          <div className="field-group" style={{ flex: 2 }}>
            <label>NOMBRE DEL EQUIPO</label>
            <input type="text" value={form.nombre} required placeholder="Ej: Equipo Operaciones Norte"
              onChange={e => setForm((f: any) => ({ ...f, nombre: e.target.value }))} />
          </div>
          <div className="field-group" style={{ flex: 1 }}>
            <label>CANTIDAD DE INTEGRANTES</label>
            <input type="number" min={0} value={form.cantidadIntegrantes}
              onChange={e => setForm((f: any) => ({ ...f, cantidadIntegrantes: parseInt(e.target.value) || 0 }))} />
          </div>
        </div>
        <div className="field-row" style={{ display: 'flex', gap: '1rem' }}>
          <div className="field-group" style={{ flex: 1 }}>
            <label>LÍDER DEL EQUIPO</label>
            <input type="text" value={form.lider} required placeholder="Ej: María González"
              onChange={e => setForm((f: any) => ({ ...f, lider: e.target.value }))} />
          </div>
          <div className="field-group" style={{ flex: 1 }}>
            <label>ÁREA / DEPARTAMENTO</label>
            <input type="text" value={form.areaId} required placeholder="Ej: Operaciones Mineras"
              onChange={e => setForm((f: any) => ({ ...f, areaId: e.target.value }))} />
          </div>
        </div>
        {err && <div className="alert-error">{err}</div>}
        {ok && <div className="alert-success">{ok}</div>}
        <button type="submit" className="btn-create" disabled={creating}>
          {creating ? 'GUARDANDO...' : '+ CREAR EQUIPO'}
        </button>
      </form>
    </section>
  );
}
