import React from 'react';
import { SectionHeader } from '../DashboardComponents';

export function ResumenSection({ resumen, onRefresh }: { resumen: any, onRefresh: () => void }) {
  return (
    <section className="content-section">
      <SectionHeader title="Resumen BFF" desc="Orquestación KPIs + Metas"
        badge="Bearer Token" badgeType="auth" onRefresh={onRefresh} loading={resumen.loading} />
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
