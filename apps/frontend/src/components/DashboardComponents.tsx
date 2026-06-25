import { KpiRaw, Equipo, Meta, EstadoMeta } from '../api';

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
            {loading ? '...' : 'ACTUALIZAR'}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── StatCard — tarjeta de métrica global ────────────────────── */
export function StatCard({ label, value, sub, color }: {
  label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color: color ?? 'var(--accent)' }}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

/* ── KpiCard ─────────────────────────────────────────────────── */
export function KpiCard({ kpi, onClick }: { kpi: KpiRaw; onClick?: () => void }) {
  return (
    <div className="kpi-card" style={{ cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <div className="kpi-card-top">
        <span className="kpi-area">{kpi.areaId}</span>
        <span className="kpi-area" style={{ color: 'var(--text-muted)' }}>{kpi.unidadMedicion}</span>
      </div>
      <div className="kpi-nombre">{kpi.nombre}</div>
      <div className="kpi-valor">
        {kpi.valor.toLocaleString('es-CL')}
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginLeft: '6px' }}>{kpi.unidadMedicion}</span>
      </div>
      {kpi.descripcion && (
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.4 }}>
          {kpi.descripcion}
        </div>
      )}
      {onClick && (
        <div style={{ marginTop: '1rem', fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 700, letterSpacing: '1px' }}>
          REGISTRAR MEDICIÓN →
        </div>
      )}
      <div className="kpi-id" style={{ marginTop: '0.5rem' }}>ID: {kpi.id.slice(0, 8)}…</div>
    </div>
  );
}

/* ── EquipoCard ──────────────────────────────────────────────── */
export function EquipoCard({ equipo }: { equipo: Equipo }) {
  return (
    <div className="kpi-card">
      <div className="kpi-card-top">
        <span className="kpi-area">{equipo.area?.nombre ?? equipo.areaId}</span>
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
const ESTADO_META: Record<EstadoMeta, { cls: string; label: string }> = {
  EXCELENTE:   { cls: 'status-ok',          label: 'EXCELENTE'   },
  EN_PROGRESO: { cls: 'status-progress',    label: 'EN PROGRESO' },
  NO_CUMPLIDA: { cls: 'status-nocumplida',  label: 'NO CUMPLIDA' },
};

const OPERADOR_LABEL: Record<string, string> = {
  '>=': '≥', '<=': '≤', '=': '=',
};

export function MetaCard({ meta, onEditar, onEliminar }: {
  meta: Meta;
  onEditar: (m: Meta) => void;
  onEliminar: (id: string) => void;
}) {
  const tasa = meta.tasaCumplimiento ?? 0;
  const pct = Math.min(tasa, 100);
  const estadoInfo = ESTADO_META[meta.estado as EstadoMeta] ?? { cls: 'status-progress', label: meta.estado };
  const barColor = meta.estado === 'EXCELENTE' ? 'var(--teal)' : meta.estado === 'NO_CUMPLIDA' ? 'var(--red)' : 'var(--gold)';

  return (
    <div className="kpi-card">
      {/* Header */}
      <div className="kpi-card-top">
        <span className="kpi-area">{meta.areaId}</span>
        <span className={`kpi-status ${estadoInfo.cls}`}>{estadoInfo.label}</span>
      </div>

      {/* Período */}
      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '0.25rem' }}>
        {meta.periodo}
      </div>

      {/* Nombre */}
      <div className="kpi-nombre">{meta.nombre}</div>

      {/* Objetivo */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', margin: '0.75rem 0' }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Objetivo</span>
        <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)' }}>
          {OPERADOR_LABEL[meta.operador] ?? meta.operador} {meta.valorObjetivo.toLocaleString('es-CL')}
        </span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{meta.unidad}</span>
      </div>

      {/* Descripción narrativa */}
      {meta.descripcionObjetivo && (
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '0.75rem', lineHeight: 1.5, borderLeft: '2px solid var(--border)', paddingLeft: '0.75rem' }}>
          "{meta.descripcionObjetivo}"
        </div>
      )}

      {/* Barra de cumplimiento */}
      <div style={{ marginBottom: '0.4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Tasa de Cumplimiento</span>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: barColor }}>{tasa.toFixed(1)}%</span>
        </div>
        <div className="kpi-bar-container">
          <div className="kpi-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
        </div>
      </div>

      {/* Fechas */}
      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        📅 {new Date(meta.fechaInicio).toLocaleDateString('es-CL')} → {new Date(meta.fechaFin).toLocaleDateString('es-CL')}
        {meta.totalMediciones !== undefined && (
          <span style={{ marginLeft: '0.75rem' }}>· {meta.totalMediciones} mediciones</span>
        )}
      </div>

      {/* Acciones */}
      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1rem' }}>
        <button className="action-btn btn-edit" style={{ flex: 1 }} onClick={() => onEditar(meta)}>EDITAR</button>
        <button className="action-btn btn-delete" style={{ flex: 1 }} onClick={() => onEliminar(meta.id)}>ELIMINAR</button>
      </div>
    </div>
  );
}
