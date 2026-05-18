import React, { useState } from 'react';
import { SectionHeader, MetaCard } from '../DashboardComponents';
import { Meta, CreateMetaPayload, getKpiPorId, KpiRaw } from '../../api';

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
  const [percentMode, setPercentMode] = useState(false);
  const [percentValue, setPercentValue] = useState(15);
  const [calcLoading, setCalcLoading] = useState(false);

  const handleCalcPercent = async () => {
    if (!form.indicadorId) {
      alert('Debes ingresar un Indicador ID para calcular el aumento');
      return;
    }
    setCalcLoading(true);
    try {
      const kpi = await getKpiPorId(form.indicadorId);
      const factor = 1 + (percentValue / 100);
      const nuevoObjetivo = Math.round(kpi.valor * factor);
      setForm((f: any) => ({
        ...f,
        valorActual: kpi.valor,
        valorObjetivo: nuevoObjetivo,
        nombre: f.nombre || `${percentValue}% más en ${kpi.nombre}`
      }));
    } catch (e) {
      alert('No se pudo obtener el valor del KPI para el cálculo');
    } finally {
      setCalcLoading(false);
    }
  };

  return (
    <section className="content-section animated-fade-in">
      <SectionHeader
        title={editMetaId ? 'Editar Meta' : 'Crear Nueva Meta'}
        desc={`${editMetaId ? 'PUT' : 'POST'} /api/metas · ms-metas (:3002)`}
        badge="Sin Autenticación" badgeType="open" />

      <form className="create-form" onSubmit={onSubmit}>
        <div className="field-group">
          <label>NOMBRE DE LA META</label>
          <input type="text" value={form.nombre} required placeholder="Ej: Aumentar Ventas 15%"
            onChange={e => setForm((f: any) => ({ ...f, nombre: e.target.value }))} />
        </div>
        <div className="field-group">
          <label>ÁREA / DEPARTAMENTO</label>
          <input type="text" value={form.areaId} required placeholder="Ej: Ventas"
            onChange={e => setForm((f: any) => ({ ...f, areaId: e.target.value }))} />
        </div>
        <div className="field-group">
          <label>KPI A TRACKEAR (VINCULACIÓN)</label>
          <select
            value={form.indicadorId || ''}
            onChange={e => setForm((f: any) => ({ ...f, indicadorId: e.target.value }))}
            style={{ width: '100%', padding: '0.75rem', background: 'var(--surface-light)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', outline: 'none', appearance: 'auto' }}
          >
            <option value="">-- Sin Vincular (Meta Manual) --</option>
            {kpis?.map(k => (
              <option key={k.id} value={k.id}>{k.nombre} (Área: {k.areaId}) - Actual: {k.valor}</option>
            ))}
          </select>
          <p className="nav-sub" style={{ marginTop: '4px' }}>Selecciona un KPI para que el progreso de la meta se actualice automáticamente al ingresar nuevos valores.</p>
        </div>
        <div className="field-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.6rem', color: 'var(--accent)', fontWeight: 'bold' }}>TIPO DE META</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="button" className={`nav-item ${!percentMode ? 'active' : ''}`} style={{ padding: '5px 10px', fontSize: '0.7rem' }} onClick={() => setPercentMode(false)}>VALOR FIJO</button>
              <button type="button" className={`nav-item ${percentMode ? 'active' : ''}`} style={{ padding: '5px 10px', fontSize: '0.7rem' }} onClick={() => setPercentMode(true)}>INCREMENTO %</button>
            </div>
          </div>
          {percentMode && (
            <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
              <div className="field-group" style={{ marginBottom: 0 }}>
                <label>% AUMENTO</label>
                <input type="number" value={percentValue} onChange={e => setPercentValue(parseFloat(e.target.value) || 0)} style={{ width: '80px' }} />
              </div>
              <button type="button" className="btn-refresh" onClick={handleCalcPercent} disabled={calcLoading} style={{ height: '38px' }}>
                {calcLoading ? '...' : 'CALCULAR'}
              </button>
            </div>
          )}
        </div>

        <div className="field-row" style={{ display: 'flex', gap: '1rem' }}>
          <div className="field-group" style={{ flex: 1 }}>
            <label>VALOR OBJETIVO (META)</label>
            <input type="number" value={form.valorObjetivo === 0 ? '' : form.valorObjetivo} required
              onChange={e => setForm((f: any) => ({ ...f, valorObjetivo: parseFloat(e.target.value) || 0 }))} />
            {percentMode && <p className="nav-sub">Calculado automáticamente</p>}
          </div>
          <div className="field-group" style={{ flex: 1 }}>
            <label>VALOR ACTUAL (INICIO)</label>
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
