import React from 'react';
import { SectionHeader, MetaCard } from '../DashboardComponents';
import { Meta, CreateMetaPayload } from '../../api';

export function MetaListView({ metas, onRefresh, onEditar, onEliminar }: {
  metas: any;
  onRefresh: () => void;
  onEditar: (m: Meta) => void;
  onEliminar: (id: string) => void;
}) {
  return (
    <section className="content-section">
      <SectionHeader title="Metas" desc="GET /api/metas · ms-metas (:3002)"
        badge="Sin Autenticación" badgeType="open" onRefresh={onRefresh} loading={metas.loading} />
      <div className="kpi-grid">
        {metas.data?.map((m: Meta) => (
          <MetaCard key={m.id} meta={m} onEditar={onEditar} onEliminar={onEliminar} />
        ))}
      </div>
    </section>
  );
}

export function MetaCreateForm({ form, setForm, onSubmit, creating, ok, err, editMetaId, onCancel }: {
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
    <section className="content-section">
      <SectionHeader 
        title={editMetaId ? 'Editar Meta' : 'Crear Nueva Meta'} 
        desc={`${editMetaId ? 'PUT' : 'POST'} /api/metas · ms-metas (:3002)`}
        badge="Sin Autenticación" badgeType="open" 
      />
      <form className="create-form" onSubmit={onSubmit}>
        <div className="field-group">
          <label>NOMBRE DE LA META</label>
          <input type="text" value={form.nombre} required placeholder="Ej: Meta de Ventas Q4"
            onChange={e => setForm((f: any) => ({ ...f, nombre: e.target.value }))} />
        </div>
        <div className="field-group">
          <label>INDICADOR ID (KPI)</label>
          <input type="text" value={form.areaId} required placeholder="ID del área o indicador a trackear"
            onChange={e => setForm((f: any) => ({ ...f, areaId: e.target.value }))} />
        </div>
        <div className="field-row" style={{display: 'flex', gap: '1rem'}}>
          <div className="field-group" style={{flex: 1}}>
            <label>VALOR OBJETIVO</label>
            <input type="number" value={form.valorObjetivo === 0 ? '' : form.valorObjetivo} required
              onChange={e => setForm((f: any) => ({ ...f, valorObjetivo: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div className="field-group" style={{flex: 1}}>
            <label>VALOR ACTUAL</label>
            <input type="number" value={form.valorActual} required
              onChange={e => setForm((f: any) => ({ ...f, valorActual: parseFloat(e.target.value) || 0 }))} />
          </div>
        </div>
        <div className="field-group">
          <label>FECHA LÍMITE</label>
          <input type="date" value={form.fechaLimite} required
            onChange={e => setForm((f: any) => ({ ...f, fechaLimite: e.target.value }))} />
        </div>
        {err && <div className="alert-error">{err}</div>}
        {ok  && <div className="alert-success">{ok}</div>}
        <div style={{display: 'flex', gap: '1rem'}}>
          <button type="submit" className="btn-create" style={{flex: 2}} disabled={creating}>
            {creating ? 'GUARDANDO...' : (editMetaId ? 'ACTUALIZAR META' : '+ CREAR META')}
          </button>
          {editMetaId && (
            <button type="button" className="btn-refresh" style={{flex: 1}} onClick={onCancel}>
              CANCELAR
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
