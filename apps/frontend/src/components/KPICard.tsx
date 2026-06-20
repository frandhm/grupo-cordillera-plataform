/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { KpiDetailedInfo, KPI, UserRole } from '../types.js';
import { Award, Target, Calendar, ClipboardCheck, Plus, HelpCircle, History, Edit3 } from 'lucide-react';

interface KpiCardProps {
  detailedKpi: KpiDetailedInfo;
  onAddMeasurement: (kpiId: string) => void;
  onAddGoal: (kpiId: string) => void;
  onEditKpi: (kpi: KPI) => void;
  role?: UserRole;
}

export const KpiCard: React.FC<KpiCardProps> = ({ detailedKpi, onAddMeasurement, onAddGoal, onEditKpi, role = 'ADMIN' }) => {
  const { kpi, area, latestGoal, measurements, complianceRate, status } = detailedKpi;
  const [showHistory, setShowHistory] = useState(false);

  // Status badges configuration
  const statusStyles = {
    EXCELLENT: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      badge: 'bg-emerald-500 text-white',
      msg: 'Excelente',
      progress: 'bg-emerald-500'
    },
    WARNING: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      badge: 'bg-amber-500 text-slate-900',
      msg: 'Aviso (Sujeto a desvíos)',
      progress: 'bg-amber-500'
    },
    CRITICAL: {
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      badge: 'bg-rose-500 text-white',
      msg: 'Crítico (Bajo umbral tolerable)',
      progress: 'bg-rose-500'
    },
    NO_DATA: {
      bg: 'bg-slate-50 border-slate-200 text-slate-600',
      badge: 'bg-slate-400 text-white',
      msg: 'Sin Mediciones',
      progress: 'bg-slate-300'
    }
  };

  const currentStyle = statusStyles[status || 'NO_DATA'];

  // Handcrafting the SVG Sparkline data
  const renderSparkline = () => {
    if (measurements.length < 2) return null;

    const width = 360;
    const height = 90;
    const padding = 10;

    const values = measurements.map(m => m.value);
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);
    const valRange = maxVal - minVal === 0 ? 1 : maxVal - minVal;

    // Build SVG coordinates
    const points = measurements.map((m, index) => {
      const x = padding + (index / (measurements.length - 1)) * (width - padding * 2);
      const y = height - padding - ((m.value - minVal) / valRange) * (height - padding * 2);
      return { x, y, value: m.value, date: m.date };
    });

    // SVG path string
    const dLine = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const dArea = `${dLine} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return (
      <div className="space-y-1 bg-slate-50 border border-slate-100 p-3 rounded-xl">
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">
          <span>Evolución Histórica ({measurements.length} tomas)</span>
          <span>Máx: {maxVal} {kpi.unitOfMeasurement} / Mín: {minVal} {kpi.unitOfMeasurement}</span>
        </div>
        
        <div className="relative h-[90px] w-full mt-2">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            {/* Area Gradient fill */}
            <path d={dArea} fill="url(#sparkline-grad)" opacity="0.15" />
            
            {/* Grid Helper lines */}
            <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#cbd5e1" strokeDasharray="3,3" strokeWidth="0.5" />

            {/* Main Sparkline */}
            <path d={dLine} fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Dynamic node circles */}
            {points.map((p, idx) => (
              <g key={idx} className="group/node">
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="3.5"
                  className="fill-emerald-600 stroke-white stroke-2 group-hover/node:r-5 cursor-pointer transition-all"
                />
                <title>{`${p.value} ${kpi.unitOfMeasurement} (${p.date})`}</title>
              </g>
            ))}

            {/* Gradient definition */}
            <defs>
              <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="flex justify-between items-center text-[9px] text-slate-400 font-serif px-1">
          <span>{measurements[0].date}</span>
          <span>{measurements[measurements.length - 1].date}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
      {/* Header Info */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded font-mono">
              KPI
            </span>
            {area && (
              <span className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                🏢 {area.name}
              </span>
            )}
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 font-display tracking-tight mt-1.5 leading-tight">{kpi.name}</h3>
          <p className="text-xs text-slate-500 font-sans mt-1 leading-relaxed">
            {kpi.description}
          </p>
        </div>

        {role === 'ADMIN' && (
          <button
            onClick={() => onEditKpi(kpi)}
            className="text-slate-400 hover:text-indigo-600 p-1.5 hover:bg-slate-50 rounded-lg transition-colors"
            title="Editar información"
          >
            <Edit3 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Primary Goal Section */}
      <div className="border border-slate-100 rounded-xl p-4 bg-slate-50 space-y-3.5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <Target className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              Meta Organizacional
            </span>
          </div>
          {latestGoal ? (
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${currentStyle.badge}`}>
              {currentStyle.msg}
            </span>
          ) : (
            role === 'ADMIN' && (
              <button
                id={`add-goal-${kpi.id}`}
                onClick={() => onAddGoal(kpi.id)}
                className="flex items-center gap-0.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <Plus className="h-3 w-3" /> Asociar Meta
              </button>
            )
          )}
        </div>

        {latestGoal ? (
          <div className="space-y-3">
            <div className="flex justify-between items-end gap-2">
              <div>
                <p className="text-xs text-slate-600 font-bold">{latestGoal.periodName}</p>
                <p className="text-[10px] text-slate-400 flex items-center gap-1 font-mono mt-0.5">
                  <Calendar className="h-3 w-3" /> {latestGoal.periodStart} al {latestGoal.periodEnd}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-semibold block">Objetivo</span>
                <span className="text-base font-bold text-slate-800 font-mono">
                  {latestGoal.operator === 'GREATER_EQUAL' ? '≥ ' : latestGoal.operator === 'LESS_EQUAL' ? '≤ ' : '= '}
                  {latestGoal.targetValue} {kpi.unitOfMeasurement}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 font-sans italic leading-relaxed">
              &ldquo;{latestGoal.description}&rdquo;
            </p>

            {/* Compliance rating progress meter */}
            {status !== 'NO_DATA' && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Tasa de Cumplimiento Promedio:</span>
                  <span className="font-bold font-mono text-slate-800">{complianceRate}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${currentStyle.progress}`}
                    style={{ width: `${Math.min(100, complianceRate || 0)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-2.5 text-center bg-slate-100 rounded-lg">
            <HelpCircle className="h-6 w-6 text-slate-300 mx-auto mb-1" />
            <p className="text-xs text-slate-500 font-sans">
              No hay objetivos o metas definidos para este periodo del KPI.
            </p>
          </div>
        )}
      </div>

      {/* Sparkline Graph */}
      {renderSparkline()}

      {/* Action Buttons & History Drawer */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
        >
          <History className="h-3.5 w-3.5" />
          {showHistory ? 'Ocultar Histórico' : `Histórico (${measurements.length})`}
        </button>

        <button
          id={`add-measure-${kpi.id}`}
          onClick={() => onAddMeasurement(kpi.id)}
          className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-xl text-xs font-bold transition-all border border-slate-200 hover:border-emerald-200"
        >
          <Plus className="h-3 w-3" /> Añadir Entrada
        </button>
      </div>

      {/* Inline scrollable measuring list */}
      {showHistory && (
        <div className="border border-slate-150 rounded-xl max-h-[160px] overflow-y-auto bg-slate-50 p-2.5 space-y-1.5">
          <div className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider mb-2 flex items-center justify-between border-b border-slate-250 pb-1">
            <span>Últimos Registros</span>
            <span>Métrica ({kpi.unitOfMeasurement})</span>
          </div>
          {measurements.length === 0 ? (
            <p className="text-xs text-slate-400 font-serif italic py-2 text-center">
              Aún no se han guardado mediciones para este indicador.
            </p>
          ) : (
            [...measurements].reverse().map((meas) => (
              <div key={meas.id} className="bg-white border border-slate-100 hover:border-slate-200 p-2 rounded-lg flex justify-between items-start gap-3">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-bold text-slate-700 font-mono">
                    📅 {meas.date}
                  </div>
                  {meas.notes && (
                    <p className="text-[10px] text-slate-400 font-sans tracking-tight">
                      {meas.notes}
                    </p>
                  )}
                </div>
                <div className="font-bold text-slate-800 text-xs font-mono shrink-0">
                  {meas.value} {kpi.unitOfMeasurement}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
