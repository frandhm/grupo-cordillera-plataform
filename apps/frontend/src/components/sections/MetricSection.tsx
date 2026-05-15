import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../DashboardComponents';
import { getMsKpis, actualizarKpi, getHistorialKpi, KpiRaw } from '../../api';

export function MetricSection() {
  const [kpis, setKpis] = useState<KpiRaw[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState<KpiRaw | null>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [newValue, setNewValue] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  const loadKpis = async () => {
    setLoading(true);
    try {
      const data = await getMsKpis();
      setKpis(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem'}}>
          <button className="btn-refresh" onClick={() => setSelectedKpi(null)}>← VOLVER</button>
          <h2 style={{margin: 0}}>{selectedKpi.nombre}</h2>
        </div>

        <div className="create-layout" style={{gridTemplateColumns: '1fr 1.5fr', gap: '2rem', display: 'grid'}}>
          {/* Panel Izquierdo: Registrar */}
          <div className="create-form">
            <h3 style={{marginBottom: '1rem'}}>Registrar Nuevo Valor</h3>
            <div className="field-group">
              <label>VALOR ACTUAL ({selectedKpi.unidadMedicion || 'unidades'})</label>
              <input 
                type="number" 
                value={newValue} 
                placeholder="Ej: 5000"
                onChange={e => setNewValue(e.target.value)} 
              />
            </div>
            <button className="btn-create" onClick={handleAddValue} disabled={updating}>
              {updating ? 'REGISTRANDO...' : 'GUARDAR MEDICIÓN'}
            </button>
            <div style={{marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px'}}>
              <div style={{fontSize: '0.8rem', color: 'var(--text-dim)'}}>ÚLTIMO VALOR</div>
              <div style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{selectedKpi.valor.toLocaleString('es-CL')}</div>
            </div>
          </div>

          {/* Panel Derecho: Historial */}
          <div className="table-wrapper">
            <h3 style={{marginBottom: '1rem'}}>Historial de Mediciones</h3>
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
                  const prev = historial[i+1];
                  const trend = prev ? (h.valor > prev.valor ? '↑' : h.valor < prev.valor ? '↓' : '=') : '—';
                  const trendColor = trend === '↑' ? 'var(--green)' : trend === '↓' ? 'var(--red)' : 'var(--text-dim)';
                  
                  return (
                    <tr key={h.id}>
                      <td className="mono">{new Date(h.fecha).toLocaleString('es-CL')}</td>
                      <td className="mono" style={{fontWeight: 'bold'}}>{h.valor.toLocaleString('es-CL')}</td>
                      <td style={{color: trendColor, fontWeight: 'bold', textAlign: 'center'}}>{trend}</td>
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
      
      {loading && <div className="loading-state">Cargando métricas...</div>}

      <div className="metric-group-label">VENTAS Y COMERCIAL</div>
      <div className="kpi-grid" style={{marginBottom: '2rem'}}>
        {ventasKpis.length === 0 && <div className="empty-state">No hay métricas de ventas registradas.</div>}
        {ventasKpis.map(k => (
          <div key={k.id} className="kpi-card metric-card" onClick={() => handleSelectKpi(k)}>
            <div className="kpi-card-top">
              <span className="kpi-area">{k.areaId}</span>
              <span className="kpi-status status-ok">Ver Detalles →</span>
            </div>
            <div className="kpi-nombre">{k.nombre}</div>
            <div className="kpi-valor">{k.valor.toLocaleString('es-CL')} <span style={{fontSize: '0.8rem', fontWeight: 'normal'}}>{k.unidadMedicion}</span></div>
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
              <span className="kpi-status status-progress">Ver Detalles →</span>
            </div>
            <div className="kpi-nombre">{k.nombre}</div>
            <div className="kpi-valor">{k.valor.toLocaleString('es-CL')} <span style={{fontSize: '0.8rem', fontWeight: 'normal'}}>{k.unidadMedicion}</span></div>
          </div>
        ))}
      </div>
    </section>
  );
}
