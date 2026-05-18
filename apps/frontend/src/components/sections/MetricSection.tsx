import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../DashboardComponents';
import { getMsKpis, actualizarKpi, getHistorialKpi, KpiRaw, getResumenConsolidado } from '../../api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export function MetricSection({ token }: { token: string }) {
  const [kpis, setKpis] = useState<KpiRaw[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState<KpiRaw | null>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [newValue, setNewValue] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [resumen, setResumen] = useState<any[]>([]);
  const [resLoading, setResLoading] = useState(false);

  const loadKpis = async () => {
    setLoading(true);
    try {
      const data = await getMsKpis();
      setKpis(data);

      // Cargar resumen también
      setResLoading(true);
      if (token) {
        const resData = await getResumenConsolidado(token);
        setResumen(resData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setResLoading(false);
    }
  };

  useEffect(() => {
    loadKpis();
  }, []);

  const handleSelectKpi = async (kpi: KpiRaw) => {
    setSelectedKpi(kpi);
    try {
      const history = await getHistorialKpi(kpi.id);
      setHistorial(history);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddValue = async () => {
    if (!selectedKpi || !newValue) return;
    setUpdating(true);
    try {
      const updated = await actualizarKpi(selectedKpi.id, parseFloat(newValue));
      setSelectedKpi(updated);
      setNewValue('');
      // Recargar historial
      const history = await getHistorialKpi(selectedKpi.id);
      setHistorial(history);
      loadKpis(); // Recargar lista general

      // Sincronizar el dashboard (Resumen)
      if (token) {
        const resData = await getResumenConsolidado(token);
        setResumen(resData);
      }

      alert('Valor registrado correctamente');
    } catch (e) {
      alert('Error al registrar valor');
    } finally {
      setUpdating(false);
    }
  };

  // Agrupar métricas por palabra clave o área
  const ventasKpis = kpis.filter(k => k.nombre.toLowerCase().includes('venta') || k.areaId.includes('venta'));
  const otrasKpis = kpis.filter(k => !k.nombre.toLowerCase().includes('venta') && !k.areaId.includes('venta'));

  if (selectedKpi) {
    return (
      <section className="content-section animated-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <button className="btn-back" onClick={() => setSelectedKpi(null)}>← VOLVER</button>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{selectedKpi.nombre}</h2>
        </div>

        {/* Panel de Gráfico de Tendencia */}
        <div className="table-wrapper" style={{ height: '350px', padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 className="nav-section-label" style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--accent)' }}>TENDENCIA DE MEDICIÓN</h3>
          {(ResponsiveContainer as any) && (
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={[...historial].reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="fecha"
                  stroke="var(--text-muted)"
                  fontSize={10}
                  tickFormatter={(val) => new Date(val).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                />
                <YAxis stroke="var(--text-muted)" fontSize={10} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.8rem' }}
                  itemStyle={{ color: 'var(--accent)' }}
                />
                <Line type="monotone" dataKey="valor" stroke="var(--accent)" strokeWidth={3} dot={{ fill: 'var(--accent)', r: 4 }} activeDot={{ r: 8, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="create-layout" style={{ gridTemplateColumns: '1fr 1.5fr', gap: '2rem', display: 'grid' }}>
          {/* Panel Izquierdo: Registrar */}
          <div className="create-form">
            <h3 style={{ marginBottom: '1rem' }}>Añadir a la Medición</h3>
            <div className="field-group">
              <label>VALOR A SUMAR ({selectedKpi.unidadMedicion || 'unidades'})</label>
              <input
                type="number"
                value={newValue}
                placeholder="Ej: +500"
                onChange={e => setNewValue(e.target.value)}
              />
            </div>
            <button className="btn-create" onClick={handleAddValue} disabled={updating}>
              {updating ? 'AÑADIENDO...' : 'SUMAR AL TOTAL'}
            </button>
            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>ÚLTIMO VALOR</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{selectedKpi.valor.toLocaleString('es-CL')}</div>
            </div>
          </div>

          {/* Panel Derecho: Historial */}
          <div className="table-wrapper">
            <h3 style={{ marginBottom: '1rem' }}>Historial de Mediciones</h3>
            <table className="kpi-table">
              <thead>
                <tr>
                  <th>FECHA</th>
                  <th>VALOR</th>
                  <th>TENDENCIA</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((h, i) => {
                  const prev = historial[i + 1];
                  const trend = prev ? (h.valor > prev.valor ? '↑' : h.valor < prev.valor ? '↓' : '=') : '—';
                  const trendColor = trend === '↑' ? 'var(--green)' : trend === '↓' ? 'var(--red)' : 'var(--text-dim)';

                  return (
                    <tr key={h.id}>
                      <td className="mono">{new Date(h.fecha).toLocaleString('es-CL')}</td>
                      <td className="mono" style={{ fontWeight: 'bold' }}>{h.valor.toLocaleString('es-CL')}</td>
                      <td style={{ color: trendColor, fontWeight: 'bold', textAlign: 'center' }}>{trend}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="content-section">
      <SectionHeader title="Métricas de Negocio" desc="Gestiona los valores de tus KPIs en tiempo real"
        badge="Interactivo" badgeType="open" onRefresh={loadKpis} loading={loading} />

      {/* BLOQUE DASHBOARD (Movido desde Resumen BFF) */}
      <div style={{ marginBottom: '3rem' }}>
        <div className="table-wrapper" style={{ height: '300px', padding: '1.5rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)' }}>
          <h3 className="nav-section-label" style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--accent)' }}>CUMPLIMIENTO DE OBJETIVOS (DASHBOARD)</h3>
          {(ResponsiveContainer as any) && (
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={resumen.filter((i: any) => i.meta) || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="nombre" stroke="var(--text-muted)" fontSize={10} tick={{ fill: 'var(--text-muted)' }} />
                <YAxis stroke="var(--text-muted)" fontSize={10} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.8rem' }}
                />
                <Legend wrapperStyle={{ fontSize: '0.7rem', paddingTop: '10px' }} />
                <Bar name="Real" dataKey="valor" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                <Bar name="Meta" dataKey="meta.valorObjetivo" fill="var(--text-faint)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="table-wrapper">
          <table className="kpi-table">
            <thead><tr><th>KPI</th><th>EQUIPO</th><th>VALOR</th><th>META</th><th>CUMPLIMIENTO</th></tr></thead>
            <tbody>
              {resumen.map((item: any) => (
                <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => handleSelectKpi(item)}>
                  <td><strong>{item.nombre}</strong></td>
                  <td><span className="team-tag">{item.equipoId || '—'}</span></td>
                  <td className="mono">{item.valor.toLocaleString('es-CL')}</td>
                  <td>{item.meta ? item.meta.valorObjetivo : '—'}</td>
                  <td className="mono" style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{item.cumplimientoCalculado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {loading && <div className="loading-state">Cargando métricas...</div>}

      <div className="metric-group-label">VENTAS Y COMERCIAL</div>
      <div className="kpi-grid" style={{ marginBottom: '2rem' }}>
        {ventasKpis.length === 0 && <div className="empty-state">No hay métricas de ventas registradas.</div>}
        {ventasKpis.map(k => (
          <div key={k.id} className="kpi-card metric-card" onClick={() => handleSelectKpi(k)}>
            <div className="kpi-card-top">
              <span className="kpi-area">{k.areaId}</span>
              <span className="kpi-status status-ok" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(k.id); alert('ID Copiado'); }}
                  style={{ padding: '2px 6px', fontSize: '0.6rem', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)', borderRadius: '4px' }}
                >
                  COPY ID
                </button>
                Ver Detalles →
              </span>
            </div>
            <div className="kpi-nombre">{k.nombre}</div>
            <div className="kpi-valor">{k.valor.toLocaleString('es-CL')} <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>{k.unidadMedicion}</span></div>
          </div>
        ))}
      </div>

      <div className="metric-group-label">OPERACIONES Y RRHH</div>
      <div className="kpi-grid">
        {otrasKpis.length === 0 && <div className="empty-state">No hay otras métricas registradas.</div>}
        {otrasKpis.map(k => (
          <div key={k.id} className="kpi-card metric-card" onClick={() => handleSelectKpi(k)}>
            <div className="kpi-card-top">
              <span className="kpi-area">{k.areaId}</span>
              <span className="kpi-status status-progress" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(k.id); alert('ID Copiado'); }}
                  style={{ padding: '2px 6px', fontSize: '0.6rem', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)', borderRadius: '4px' }}
                >
                  COPY ID
                </button>
                Ver Detalles →
              </span>
            </div>
            <div className="kpi-nombre">{k.nombre}</div>
            <div className="kpi-valor">{k.valor.toLocaleString('es-CL')} <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>{k.unidadMedicion}</span></div>
          </div>
        ))}
      </div>
    </section>
  );
}
