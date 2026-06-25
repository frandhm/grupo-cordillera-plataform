import React, { useState, useEffect } from 'react';
import { getMsKpis, getMsMetas, actualizarKpi, getHistorialKpi, getResumenConsolidado, KpiRaw, Meta } from '../../api';
import { StatCard } from '../DashboardComponents';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

const OPERADOR_LABEL: Record<string, string> = { '>=': '≥', '<=': '≤', '=': '=' };

const ESTADO_COLOR: Record<string, string> = {
  EXCELENTE:   'var(--teal)',
  EN_PROGRESO: 'var(--gold)',
  NO_CUMPLIDA: 'var(--red)',
};

/* ── Panel de detalle de un KPI ─────────────────────────────── */
function KpiDetailPanel({ kpi, meta, onClose }: {
  kpi: KpiRaw;
  meta: Meta | undefined;
  onClose: () => void;
}) {
  const [historial, setHistorial] = useState<any[]>([]);
  const [newValue, setNewValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [currentKpi, setCurrentKpi] = useState(kpi);

  useEffect(() => {
    getHistorialKpi(kpi.id).then(setHistorial).catch(console.error);
  }, [kpi.id]);

  const handleRegistrar = async () => {
    const val = parseFloat(newValue);
    if (isNaN(val)) return;
    setSaving(true);
    setMsg(null);
    try {
      const updated = await actualizarKpi(currentKpi.id, val);
      setCurrentKpi(updated);
      setNewValue('');
      const h = await getHistorialKpi(currentKpi.id);
      setHistorial(h);
      setMsg({ type: 'ok', text: `✓ Valor actualizado a ${val.toLocaleString('es-CL')} ${currentKpi.unidadMedicion}` });
    } catch {
      setMsg({ type: 'err', text: 'Error al registrar el valor.' });
    } finally {
      setSaving(false);
    }
  };

  const chartData = historial.map(h => ({
    fecha: new Date(h.fecha).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }),
    valor: h.valor,
  }));

  return (
    <div className="detail-panel animated-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button className="btn-refresh" onClick={onClose}>← VOLVER</button>
        <div>
          <div style={{ fontSize: '0.6rem', color: 'var(--accent)', letterSpacing: '2px', fontWeight: 800 }}>{currentKpi.areaId}</div>
          <h2 style={{ margin: 0, fontSize: '1.3rem' }}>{currentKpi.nombre}</h2>
          {currentKpi.descripcion && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{currentKpi.descripcion}</p>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard label="VALOR ACTUAL" value={`${currentKpi.valor.toLocaleString('es-CL')} ${currentKpi.unidadMedicion}`} />
        <StatCard label="MEDICIONES" value={historial.length} sub="en historial" color="var(--text)" />
        {meta
          ? <StatCard label="META ASOCIADA" value={`${OPERADOR_LABEL[meta.operador] ?? meta.operador} ${meta.valorObjetivo} ${meta.unidad}`} sub={meta.periodo} color={ESTADO_COLOR[meta.estado] ?? 'var(--text-muted)'} />
          : <StatCard label="META ASOCIADA" value="Sin meta" color="var(--text-muted)" />
        }
      </div>

      {/* Gráfico de tendencia */}
      <div className="table-wrapper" style={{ padding: '1.5rem', marginBottom: '1.5rem', height: 260 }}>
        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '2px', fontWeight: 800, marginBottom: '1rem' }}>
          EVOLUCIÓN HISTÓRICA ({historial.length} TOMAS)
        </div>
        {historial.length === 0
          ? <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', paddingTop: '2rem', textAlign: 'center' }}>Sin mediciones aún.</div>
          : (
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="fecha" stroke="var(--text-muted)" fontSize={10} />
                <YAxis stroke="var(--text-muted)" fontSize={10} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.8rem' }}
                  itemStyle={{ color: 'var(--accent)' }}
                />
                {meta && (
                  <ReferenceLine
                    y={meta.valorObjetivo}
                    stroke={ESTADO_COLOR[meta.estado] ?? 'var(--gold)'}
                    strokeDasharray="6 3"
                    label={{ value: `Objetivo ${meta.valorObjetivo}`, fill: 'var(--text-muted)', fontSize: 10, position: 'insideTopRight' }}
                  />
                )}
                <Line
                  type="monotone" dataKey="valor" stroke="var(--accent)"
                  strokeWidth={2} dot={{ fill: 'var(--accent)', r: 3 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )
        }
      </div>

      {/* Registrar nuevo valor */}
      <div className="table-wrapper" style={{ padding: '1.5rem' }}>
        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '2px', fontWeight: 800, marginBottom: '1rem' }}>
          REGISTRAR NUEVA MEDICIÓN
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div className="field-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>NUEVO VALOR ({currentKpi.unidadMedicion})</label>
            <input
              type="number" value={newValue} step="any"
              placeholder={`Ej: ${currentKpi.valor}`}
              onChange={e => setNewValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRegistrar()}
            />
          </div>
          <button className="btn-create" style={{ padding: '0.75rem 1.5rem', whiteSpace: 'nowrap' }}
            onClick={handleRegistrar} disabled={saving || !newValue}>
            {saving ? 'GUARDANDO...' : '+ AÑADIR ENTRADA'}
          </button>
        </div>
        {msg && (
          <div className={msg.type === 'ok' ? 'alert-success' : 'alert-error'} style={{ marginTop: '0.75rem' }}>
            {msg.text}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Vista principal del Dashboard ──────────────────────────── */
export function MetricSection({ token }: { token: string }) {
  const [kpis, setKpis] = useState<KpiRaw[]>([]);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKpi, setSelectedKpi] = useState<KpiRaw | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [k, m] = await Promise.all([getMsKpis(), getMsMetas()]);
      setKpis(k);
      setMetas(m);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Si hay un KPI seleccionado, mostrar panel de detalle
  if (selectedKpi) {
    const metaVinculada = metas.find(m => m.indicadorId === selectedKpi.id);
    return (
      <section className="content-section">
        <KpiDetailPanel
          kpi={selectedKpi}
          meta={metaVinculada}
          onClose={() => { setSelectedKpi(null); load(); }}
        />
      </section>
    );
  }

  // Estadísticas globales
  const totalExcelente = metas.filter(m => m.estado === 'EXCELENTE').length;
  const totalNoCumplida = metas.filter(m => m.estado === 'NO_CUMPLIDA').length;
  const totalEnProgreso = metas.filter(m => m.estado === 'EN_PROGRESO').length;

  return (
    <section className="content-section animated-fade-in">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2>Dashboard & Métricas</h2>
          <p className="section-desc">Vista consolidada del desempeño organizacional</p>
        </div>
        <button className="btn-refresh" onClick={load} disabled={loading}>
          {loading ? '...' : 'ACTUALIZAR'}
        </button>
      </div>

      {loading && <div className="loading-state">Cargando datos...</div>}

      {/* Fila de estadísticas globales */}
      {!loading && (
        <div className="stats-row">
          <StatCard label="KPIS REGISTRADOS"  value={kpis.length}       sub="indicadores activos"   color="var(--accent)" />
          <StatCard label="METAS EXCELENTE"   value={totalExcelente}    sub="objetivos cumplidos"   color="var(--teal)"   />
          <StatCard label="EN PROGRESO"       value={totalEnProgreso}   sub="dentro del período"    color="var(--gold)"   />
          <StatCard label="NO CUMPLIDAS"      value={totalNoCumplida}   sub="requieren atención"    color="var(--red)"    />
        </div>
      )}

      {/* Tabla de KPIs */}
      {!loading && kpis.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div className="dash-block-label">INDICADORES DE DESEMPEÑO</div>
          <div className="table-wrapper">
            <table className="kpi-table">
              <thead>
                <tr>
                  <th>NOMBRE</th>
                  <th>ÁREA</th>
                  <th>VALOR ACTUAL</th>
                  <th>UNIDAD</th>
                  <th>META VINCULADA</th>
                  <th>TASA CUMPLIMIENTO</th>
                  <th>ACCIÓN</th>
                </tr>
              </thead>
              <tbody>
                {kpis.map(k => {
                  const meta = metas.find(m => m.indicadorId === k.id);
                  const tasa = meta?.tasaCumplimiento;
                  const barColor = meta
                    ? (ESTADO_COLOR[meta.estado] ?? 'var(--gold)')
                    : 'var(--border)';
                  return (
                    <tr key={k.id}>
                      <td>
                        <strong style={{ fontSize: '0.8rem' }}>{k.nombre}</strong>
                        {k.descripcion && <div className="nav-sub">{k.descripcion}</div>}
                      </td>
                      <td><span className="area-tag">{k.areaId}</span></td>
                      <td className="mono" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        {k.valor.toLocaleString('es-CL')}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{k.unidadMedicion}</td>
                      <td>
                        {meta
                          ? (
                            <span style={{ fontSize: '0.75rem' }}>
                              <span style={{ color: ESTADO_COLOR[meta.estado] ?? 'var(--text-muted)', fontWeight: 700 }}>
                                {OPERADOR_LABEL[meta.operador] ?? meta.operador} {meta.valorObjetivo} {meta.unidad}
                              </span>
                              <div className="nav-sub">{meta.periodo}</div>
                            </span>
                          )
                          : <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Sin meta</span>
                        }
                      </td>
                      <td style={{ minWidth: 120 }}>
                        {tasa !== undefined ? (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                              <span style={{ fontSize: '0.65rem', color: barColor, fontWeight: 700 }}>{tasa.toFixed(1)}%</span>
                            </div>
                            <div style={{ height: 4, background: 'var(--bg)', borderRadius: 10, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${Math.min(tasa, 100)}%`, background: barColor, borderRadius: 10, transition: 'width 0.5s' }} />
                            </div>
                          </div>
                        ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>—</span>}
                      </td>
                      <td>
                        <button
                          className="action-btn btn-edit"
                          onClick={() => setSelectedKpi(k)}
                        >
                          VER / MEDIR
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabla de Metas */}
      {!loading && metas.length > 0 && (
        <div>
          <div className="dash-block-label">METAS ORGANIZACIONALES</div>
          <div className="table-wrapper">
            <table className="kpi-table">
              <thead>
                <tr>
                  <th>META</th>
                  <th>PERÍODO</th>
                  <th>OBJETIVO</th>
                  <th>ÁREA</th>
                  <th>CUMPLIMIENTO</th>
                  <th>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {metas.map(m => {
                  const tasa = m.tasaCumplimiento ?? 0;
                  const barColor = ESTADO_COLOR[m.estado] ?? 'var(--gold)';
                  return (
                    <tr key={m.id}>
                      <td>
                        <strong style={{ fontSize: '0.8rem' }}>{m.nombre}</strong>
                        {m.descripcionObjetivo && (
                          <div className="nav-sub" style={{ fontStyle: 'italic' }}>"{m.descripcionObjetivo}"</div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{m.periodo}</span>
                        <div className="nav-sub">{new Date(m.fechaInicio).toLocaleDateString('es-CL')} – {new Date(m.fechaFin).toLocaleDateString('es-CL')}</div>
                      </td>
                      <td className="mono" style={{ fontWeight: 700 }}>
                        {OPERADOR_LABEL[m.operador] ?? m.operador} {m.valorObjetivo.toLocaleString('es-CL')}
                        <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 4 }}>{m.unidad}</span>
                      </td>
                      <td><span className="area-tag">{m.areaId}</span></td>
                      <td style={{ minWidth: 130 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <span style={{ fontSize: '0.65rem', color: barColor, fontWeight: 700 }}>{tasa.toFixed(1)}%</span>
                          {m.totalMediciones !== undefined && (
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{m.totalMediciones} mediciones</span>
                          )}
                        </div>
                        <div style={{ height: 4, background: 'var(--bg)', borderRadius: 10, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min(tasa, 100)}%`, background: barColor, borderRadius: 10 }} />
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: barColor }}>
                          {m.estado.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && kpis.length === 0 && (
        <div className="empty-state">No hay KPIs registrados aún. Ve a "Crear KPI" para comenzar.</div>
      )}
    </section>
  );
}
