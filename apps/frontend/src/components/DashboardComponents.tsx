import { KpiGateway, Equipo, Meta, EstadoMeta } from '../api';

/* ── SectionHeader ───────────────────────────────────────────── */
export function SectionHeader({ title, desc, badge, badgeType, onRefresh, loading }: {
  title: string; desc: string; badge: string; badgeType: 'auth' | 'open';
  onRefresh?: () => void; loading?: boolean;
}) {
  return (
    <div className="section-header">
      <div>
        <h2>{title}</h2>
        <p className="section-desc">{desc}</p>
      </div>
      <div className="header-actions">
        <span className={`badge badge-${badgeType === 'auth' ? 'auth' : 'open'}`}>
          {badgeType === 'auth' ? '🔐' : '🔓'} {badge}
        </span>
        {onRefresh && (
          <button className="btn-refresh" onClick={onRefresh} disabled={loading}>
            {loading ? '...' : '↻ Actualizar'}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── KpiCard ─────────────────────────────────────────────────── */
export function KpiCard({ kpi }: { kpi: KpiGateway }) {
  const pct = Math.min(parseFloat(kpi.cumplimiento), 100);
  return (
    <div className="kpi-card">
      <div className="kpi-card-top">
        <span className="kpi-area">{kpi.areaId}</span>
        <span className={`kpi-status ${kpi.estado === 'META CUMPLIDA' ? 'status-ok' : 'status-progress'}`}>
          {kpi.estado}
        </span>
      </div>
      <div className="kpi-nombre">{kpi.nombre}</div>
      <div className="kpi-valor">
        {kpi.valor.toLocaleString('es-CL')} 
        <span style={{fontSize: '0.9rem', color: 'var(--text-dim)', marginLeft: '4px'}}>{kpi.unidadMedicion}</span>
      </div>
      <div className="kpi-bar-container">
        <div className="kpi-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="kpi-cumplimiento">{kpi.cumplimiento} de la meta</div>
      <div className="kpi-id">ID: {kpi.id.slice(0, 8)}…</div>
    </div>
  );
}

/* ── EquipoCard ──────────────────────────────────────────────── */
export function EquipoCard({ equipo }: { equipo: Equipo }) {
  return (
    <div className="kpi-card">
      <div className="kpi-card-top">
        <span className="kpi-area">{equipo.areaId}</span>
        <span className="kpi-status status-ok">{equipo.cantidadIntegrantes} miembros</span>
      </div>
      <div className="kpi-nombre">{equipo.nombre}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
        <span>👤</span>
        <span style={{ fontSize: '0.9rem', color: 'var(--text)' }}>{equipo.lider}</span>
      </div>
      <div className="kpi-id" style={{ marginTop: '0.5rem' }}>
        {new Date(equipo.fechaCreacion).toLocaleDateString('es-CL')}
      </div>
    </div>
  );
}

/* ── MetaCard ────────────────────────────────────────────────── */
const ESTADO_CLASS: Record<EstadoMeta, string> = {
  CUMPLIDA:    'status-ok',
  EN_PROGRESO: 'status-progress',
  NO_CUMPLIDA: 'status-nocumplida',
};

export function MetaCard({ meta, onEditar, onEliminar }: {
  meta: Meta;
  onEditar: (m: Meta) => void;
  onEliminar: (id: string) => void;
}) {
  const pct = Math.min((meta.valorActual / meta.valorObjetivo) * 100, 100);
  return (
    <div className="kpi-card">
      <div className="kpi-card-top">
        <span className="kpi-area">{meta.areaId}</span>
        <span className={`kpi-status ${ESTADO_CLASS[meta.estado as EstadoMeta] ?? 'status-progress'}`}>
          {meta.estado.replace('_', ' ')}
        </span>
      </div>
      <div className="kpi-nombre">{meta.nombre}</div>
      <div className="kpi-valor">{meta.valorActual.toLocaleString('es-CL')}</div>
      <div className="kpi-bar-container">
        <div className="kpi-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="kpi-cumplimiento">
        {meta.porcentajeCumplimiento ?? `${pct.toFixed(2)}%`} · objetivo: {meta.valorObjetivo.toLocaleString('es-CL')}
      </div>
      <div className="kpi-id">Límite: {new Date(meta.fechaLimite).toLocaleDateString('es-CL')}</div>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
        <button className="btn-refresh" style={{ flex: 1 }} onClick={() => onEditar(meta)}>✎ Editar</button>
        <button
          className="btn-refresh"
          style={{ flex: 1, borderColor: 'var(--red)', color: 'var(--red)' }}
          onClick={() => onEliminar(meta.id)}
        >✕ Eliminar</button>
      </div>
    </div>
  );
}
