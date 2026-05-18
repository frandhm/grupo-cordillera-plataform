import React from 'react';
import { SectionHeader } from '../DashboardComponents';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export function ResumenSection({ resumen, onRefresh }: { resumen: any, onRefresh: () => void }) {
  return (
    <section className="content-section">
      <SectionHeader title="Resumen BFF" desc="Orquestación KPIs + Metas"
        badge="Bearer Token" badgeType="auth" onRefresh={onRefresh} loading={resumen.loading} />
      
      {/* Gráfico de Cumplimiento Global */}
      <div className="table-wrapper" style={{height: '300px', padding: '1.5rem', marginBottom: '2rem', background: 'rgba(0,0,0,0.2)'}}>
        <h3 className="nav-section-label" style={{marginTop: 0, marginBottom: '1rem', color: 'var(--accent)'}}>CUMPLIMIENTO DE OBJETIVOS</h3>
        {(ResponsiveContainer as any) && (
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={resumen.data?.filter((i:any) => i.meta) || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="nombre" stroke="var(--text-muted)" fontSize={10} tick={{fill: 'var(--text-muted)'}} />
              <YAxis stroke="var(--text-muted)" fontSize={10} />
              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                contentStyle={{background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.8rem'}}
              />
              <Legend wrapperStyle={{fontSize: '0.7rem', paddingTop: '10px'}} />
              <Bar name="Valor Actual" dataKey="valor" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              <Bar name="Meta" dataKey="meta.valorObjetivo" fill="var(--text-faint)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="table-wrapper">
        <table className="kpi-table">
          <thead><tr><th>KPI</th><th>ÁREA</th><th>VALOR</th><th>META</th><th>CUMPLIMIENTO</th><th>ESTADO</th></tr></thead>
          <tbody>
            {resumen.data?.map((item: any) => (
              <tr key={item.id}>
                <td><strong>{item.nombre}</strong><div className="nav-sub">{item.unidadMedicion}</div></td>
                <td><span className="area-tag">{item.areaId}</span></td>
                <td className="mono">{item.valor.toLocaleString('es-CL')}</td>
                <td>{item.meta ? item.meta.nombre : 'Sin Meta'}</td>
                <td className="mono" style={{fontWeight:'bold'}}>{item.cumplimientoCalculado}</td>
                <td>{item.meta?.estado || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
