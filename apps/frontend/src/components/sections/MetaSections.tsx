import React from 'react';
import { SectionHeader, MetaCard } from '../DashboardComponents';
import { Meta, CreateMetaPayload, OperadorMeta, KpiRaw } from '../../api';

export function MetaListView({ metas, onRefresh, onEditar, onEliminar, onCrear }: {
  metas: any;
  onRefresh: () => void;
  onEditar: (m: Meta) => void;
  onEliminar: (id: string) => void;
  onCrear: () => void;
}) {
  return (
    <section className="content-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <SectionHeader title="Metas" desc="GET /api/metas · ms-metas (:3002)"
          badge="Sin Autenticación" badgeType="open" onRefresh={onRefresh} loading={metas.loading} />
        <button className="btn-create" style={{ marginTop: 0, padding: '0.5rem 1rem' }} onClick={onCrear}>+ NUEVA META</button>
      </div>
      <div className="kpi-grid">
        {metas.data?.map((m: Meta) => (
          <MetaCard key={m.id} meta={m} onEditar={onEditar} onEliminar={onEliminar} />
        ))}
      </div>
    </section>
  );
}

export function MetaCreateForm({ kpis, form, setForm, onSubmit, creating, ok, err, editMetaId, onCancel }: {
  kpis: KpiRaw[] | null;
  form: CreateMetaPayload;
  setForm: (f: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  creating: boolean;
  ok: string;
  err: string;
  editMetaId: string | null;
  onCancel: () => void;
}) {
  return (
    <section className="content-section animated-fade-in">
      <SectionHeader
        title={editMetaId ? 'Editar Meta' : 'Crear Nueva Meta'}
        desc={`${editMetaId ? 'PUT' : 'POST'} /api/metas · ms-metas (:3002)`}
        badge="Sin Autenticación" badgeType="open" />

      <form className="create-form" onSubmit={onSubmit}>

        {/* Nombre */}
        <div className="field-group">
          <label>NOMBRE DE LA META</label>
          <input type="text" value={form.nombre} required placeholder="Ej: Producción Mínima Semestral"
            onChange={e => setForm((f: any) => ({ ...f, nombre: e.target.value }))} />
        </div>

        {/* Período legible */}
        <div className="field-group">
          <label>PERÍODO</label>
          <input type="text" value={form.periodo} required placeholder="Ej: Semestre 1 2026"
            onChange={e => setForm((f: any) => ({ ...f, periodo: e.target.value }))} />
        </div>

        {/* Fechas */}
        <div className="field-row" style={{ display: 'flex', gap: '1rem' }}>
          <div className="field-group" style={{ flex: 1 }}>
            <label>FECHA INICIO</label>
            <input type="date" value={form.fechaInicio} required
              onChange={e => setForm((f: any) => ({ ...f, fechaInicio: e.target.value }))} />
          </div>
          <div className="field-group" style={{ flex: 1 }}>
            <label>FECHA FIN</label>
            <input type="date" value={form.fechaFin} required
              onChange={e => setForm((f: any) => ({ ...f, fechaFin: e.target.value }))} />
          </div>
        </div>

        {/* Área */}
        <div className="field-group">
          <label>ÁREA / DEPARTAMENTO</label>
          <input type="text" value={form.areaId} required placeholder="Ej: Operaciones Mineras"
            onChange={e => setForm((f: any) => ({ ...f, areaId: e.target.value }))} />
        </div>

        {/* KPI vinculado */}
        <div className="field-group">
          <label>KPI A TRACKEAR (VINCULACIÓN)</label>
          <select
            value={form.indicadorId || ''}
            onChange={e => setForm((f: any) => ({ ...f, indicadorId: e.target.value }))}
            style={{ width: '100%', padding: '0.75rem', background: 'var(--surface-light)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', outline: 'none', appearance: 'auto' }}
          >
            <option value="">-- Sin Vincular --</option>
            {kpis?.map(k => (
              <option key={k.id} value={k.id}>{k.nombre} ({k.unidadMedicion}) — Actual: {k.valor}</option>
            ))}
          </select>
          <p className="nav-sub" style={{ marginTop: '4px' }}>
            El cumplimiento se calculará automáticamente desde el historial de mediciones del KPI seleccionado.
          </p>
        </div>

        {/* Objetivo numérico + operador + unidad */}
        <div className="field-row" style={{ display: 'flex', gap: '1rem' }}>
          <div className="field-group" style={{ flex: 1 }}>
            <label>OPERADOR</label>
            <select
              value={form.operador}
              onChange={e => setForm((f: any) => ({ ...f, operador: e.target.value as OperadorMeta }))}
              style={{ width: '100%', padding: '0.75rem', background: 'var(--surface-light)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', outline: 'none', appearance: 'auto' }}
            >
              <option value=">=">≥ (Mayor o igual — más es mejor)</option>
              <option value="<=">≤ (Menor o igual — menos es mejor)</option>
              <option value="=">=  (Igual al objetivo)</option>
            </select>
          </div>
          <div className="field-group" style={{ flex: 1 }}>
            <label>VALOR OBJETIVO</label>
            <input type="number" value={form.valorObjetivo === 0 ? '' : form.valorObjetivo} required step="any" min={0}
              placeholder="Ej: 120"
              onChange={e => setForm((f: any) => ({ ...f, valorObjetivo: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div className="field-group" style={{ flex: 1 }}>
            <label>UNIDAD</label>
            <input type="text" value={form.unidad} required placeholder="Ej: Tons, IF, %, CLP"
              onChange={e => setForm((f: any) => ({ ...f, unidad: e.target.value }))} />
          </div>
        </div>

        {/* Descripción narrativa */}
        <div className="field-group">
          <label>DESCRIPCIÓN DEL OBJETIVO</label>
          <textarea value={form.descripcionObjetivo || ''} rows={3}
            placeholder='Ej: "Mantener un promedio diario superior o igual a 120 toneladas de concentrado de cobre."'
            onChange={e => setForm((f: any) => ({ ...f, descripcionObjetivo: e.target.value }))}
            style={{ width: '100%', padding: '0.75rem', background: 'var(--surface-light)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        {err && <div className="alert-error">{err}</div>}
        {ok && <div className="alert-success">{ok}</div>}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button type="submit" className="btn-create" style={{ flex: 2 }} disabled={creating}>
            {creating ? 'GUARDANDO...' : (editMetaId ? 'GUARDAR CAMBIOS' : 'CREAR META')}
          </button>
          {editMetaId && (
            <button type="button" className="btn-cancel" style={{ flex: 1 }} onClick={onCancel}>
              CANCELAR
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
