import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../DashboardComponents';
import { getLogs } from '../../api';

export function LogsSection({ token }: { token: string }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await getLogs(token);
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <section className="content-section animated-fade-in">
      <SectionHeader title="Logs de Auditoría" desc="Registro de eventos críticos del sistema (Solo Jefe)"
        badge="Solo Admin" badgeType="auth" onRefresh={loadLogs} loading={loading} />
      
      <div className="table-wrapper">
        <table className="kpi-table">
          <thead>
            <tr>
              <th>EVENTO</th>
              <th>USUARIO</th>
              <th>DETALLE</th>
              <th>TIMESTAMP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>
                  <span className={`team-tag ${log.event.includes('FAILURE') ? 'status-nocumplida' : ''}`} 
                    style={{borderColor: log.event.includes('FAILURE') ? 'var(--red)' : 'var(--accent)', color: log.event.includes('FAILURE') ? 'var(--red)' : 'var(--accent)'}}>
                    {log.event}
                  </span>
                </td>
                <td>{log.user}</td>
                <td style={{fontSize: '0.7rem'}}>{log.detail}</td>
                <td className="mono" style={{fontSize: '0.65rem', color: 'var(--text-faint)'}}>
                  {new Date(log.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
