/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { KpiDetailedInfo, KPI, Area, DashboardOverview, UserRole } from '../types.js';
import { KpiCard } from './KPICard.js';
import { Target, Search, SlidersHorizontal, Plus, AlertCircle, Sparkles, CheckCircle2, HelpCircle } from 'lucide-react';

interface KPIDashboardProps {
  overview: DashboardOverview | null;
  detailedKpis: KpiDetailedInfo[];
  areas: Area[];
  onAddMeasurement: (kpiId: string) => void;
  onAddGoal: (kpiId: string) => void;
  onEditKpi: (kpi: KPI) => void;
  onOpenCreateKpi: () => void;
  onOpenCreateMeasurement: () => void;
  onOpenCreateGoal: () => void;
  role?: UserRole;
}

export const KPIDashboard: React.FC<KPIDashboardProps> = ({
  overview,
  detailedKpis,
  areas,
  onAddMeasurement,
  onAddGoal,
  onEditKpi,
  onOpenCreateKpi,
  onOpenCreateMeasurement,
  onOpenCreateGoal,
  role = 'ADMIN',
}) => {
  // Filtering & Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAreaId, setSelectedAreaId] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'EXCELLENT' | 'WARNING' | 'CRITICAL' | 'NO_DATA'>('ALL');

  // Filter computation
  const filteredKpis = detailedKpis.filter((item) => {
    const matchesSearch =
      item.kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kpi.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesArea = selectedAreaId === 'ALL' || item.kpi.areaId === selectedAreaId;
    const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;

    return matchesSearch && matchesArea && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Status Counters */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <button
            id="status-filter-excellent-btn"
            onClick={() => setSelectedStatus(selectedStatus === 'EXCELLENT' ? 'ALL' : 'EXCELLENT')}
            className={`p-5 rounded-2xl border text-left cursor-pointer transition-all hover:scale-[1.01] hover:shadow-xs duration-150 ${
              selectedStatus === 'EXCELLENT'
                ? 'bg-emerald-50 border-emerald-500 ring-3 ring-emerald-500/10 shadow-xs'
                : 'bg-white border-slate-200 hover:border-emerald-300 shadow-xs'
            }`}
          >
            <div className="flex justify-between items-center text-emerald-600 mb-2">
              <span className="text-[10px] font-bold tracking-wider font-mono uppercase bg-emerald-50 px-2 py-0.5 rounded">
                Excelente
              </span>
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">
              {overview.kpisByStatus.excellent}
            </p>
            <p className="text-[11px] text-slate-500 font-sans mt-1">Indicadores cumpliendo meta</p>
          </button>

          <button
            id="status-filter-warning-btn"
            onClick={() => setSelectedStatus(selectedStatus === 'WARNING' ? 'ALL' : 'WARNING')}
            className={`p-5 rounded-2xl border text-left cursor-pointer transition-all hover:scale-[1.01] hover:shadow-xs duration-150 ${
              selectedStatus === 'WARNING'
                ? 'bg-amber-50 border-amber-500 ring-3 ring-amber-500/10 shadow-xs'
                : 'bg-white border-slate-200 hover:border-amber-300 shadow-xs'
            }`}
          >
            <div className="flex justify-between items-center text-amber-600 mb-2">
              <span className="text-[10px] font-bold tracking-wider font-mono uppercase bg-amber-50 px-2 py-0.5 rounded">
                Tolerable
              </span>
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">
              {overview.kpisByStatus.warning}
            </p>
            <p className="text-[11px] text-slate-500 font-sans mt-1">Indicadores bajo desvío leve</p>
          </button>

          <button
            id="status-filter-critical-btn"
            onClick={() => setSelectedStatus(selectedStatus === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
            className={`p-5 rounded-2xl border text-left cursor-pointer transition-all hover:scale-[1.01] hover:shadow-xs duration-150 ${
              selectedStatus === 'CRITICAL'
                ? 'bg-rose-50 border-rose-500 ring-3 ring-rose-500/10 shadow-xs'
                : 'bg-white border-slate-200 hover:border-rose-300 shadow-xs'
            }`}
          >
            <div className="flex justify-between items-center text-rose-600 mb-2">
              <span className="text-[10px] font-bold tracking-wider font-mono uppercase bg-rose-50 px-2 py-0.5 rounded">
                Crítico
              </span>
              <AlertCircle className="h-4.5 w-4.5" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">
              {overview.kpisByStatus.critical}
            </p>
            <p className="text-[11px] text-slate-500 font-sans mt-1">Fuera de umbral tolerable</p>
          </button>

          <button
            id="status-filter-nodate-btn"
            onClick={() => setSelectedStatus(selectedStatus === 'NO_DATA' ? 'ALL' : 'NO_DATA')}
            className={`p-5 rounded-2xl border text-left cursor-pointer transition-all hover:scale-[1.01] hover:shadow-xs duration-150 ${
              selectedStatus === 'NO_DATA'
                ? 'bg-slate-100 border-slate-500 ring-3 ring-slate-500/10 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex justify-between items-center text-slate-600 mb-2">
              <span className="text-[10px] font-bold tracking-wider font-mono uppercase bg-slate-50 px-2 py-0.5 rounded">
                Sin Datos
              </span>
              <HelpCircle className="h-4.5 w-4.5" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">
              {overview.kpisByStatus.noData}
            </p>
            <p className="text-[11px] text-slate-500 font-sans mt-1">Metas sin tomas en periodo</p>
          </button>

        </div>
      )}

      {/* Filtering Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="dashboard-search-input"
            type="text"
            className="w-full pl-10 pr-3.5 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
            placeholder="Buscar por KPI o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters Selects */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1 text-slate-500 text-xs font-bold font-mono py-1">
            <SlidersHorizontal className="h-3.5 w-3.5" /> FILTRAR:
          </div>

          <select
            id="dashboard-area-filter"
            className="px-3.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs text-slate-700"
            value={selectedAreaId}
            onChange={(e) => setSelectedAreaId(e.target.value)}
          >
            <option value="ALL">Todas las Áreas</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>

          <select
            id="dashboard-status-filter"
            className="px-3.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs text-slate-700"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
          >
            <option value="ALL">Todos los Estados</option>
            <option value="EXCELLENT">Cumple Meta (Excelente)</option>
            <option value="WARNING">Desvío Aceptable (Tolerable)</option>
            <option value="CRITICAL">Fuera de Meta (Crítico)</option>
            <option value="NO_DATA">Sin registros (No Data)</option>
          </select>

          {/* Quick Action additions */}
          {role !== 'VENDEDOR' && (
            <div className="flex items-center gap-2 ml-auto md:ml-0 md:pl-2">
              <button
                id="new-kpi-btn"
                onClick={onOpenCreateKpi}
                className="flex items-center gap-1 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
              >
                <Plus className="h-3 w-3" /> Crear KPI
              </button>
            </div>
          )}
        </div>

      </div>

      {filteredKpis.length === 0 ? (
        <div className="bg-white border rounded-2xl py-12 text-center text-slate-500 border-slate-200 max-w-xl mx-auto">
          <Target className="h-10 w-10 text-slate-350 mx-auto mb-2" />
          <h3 className="font-bold text-slate-700">No se encontraron indicadores</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-sans">
            Comprueba que los términos descritos correspondan a las áreas asignadas o desactiva filtros activos.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedAreaId('ALL');
              setSelectedStatus('ALL');
            }}
            className="mt-4 text-xs font-semibold text-emerald-600 hover:text-emerald-800"
          >
            Restaurar Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredKpis.map((detailed) => (
            <KpiCard
              key={detailed.kpi.id}
              detailedKpi={detailed}
              onAddMeasurement={onAddMeasurement}
              onAddGoal={onAddGoal}
              onEditKpi={onEditKpi}
              role={role}
            />
          ))}
        </div>
      )}

      {/* Bottom recent measurements & analytics */}
      {overview && overview.recentMeasurements.length > 0 && (
        <div className="bg-slate-900 text-slate-300 rounded-2xl p-5 border border-slate-800 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <h3 className="text-sm font-bold tracking-wider uppercase font-mono text-white">
              Historial de Mediciones Recientes (Auditado por BFF Facade)
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {overview.recentMeasurements.map((measItem, index) => (
              <div
                key={index}
                className="bg-slate-950 border border-slate-800/80 p-3 rounded-xl flex flex-col justify-between hover:border-emerald-500/30 transition-colors"
              >
                <div>
                  <p className="text-[10px] text-slate-400 font-bold tracking-tight line-clamp-1">
                    {measItem.kpiName}
                  </p>
                  <p className="text-[9px] text-slate-500 font-mono mt-1 font-semibold block">
                    📅 {measItem.measurement.date}
                  </p>
                </div>
                
                <div className="flex justify-between items-end mt-2 pt-2 border-t border-slate-900">
                  <p className="text-[9px] text-slate-400 italic max-w-[65%] line-clamp-1">
                    {measItem.measurement.notes || 'Sin bitácora'}
                  </p>
                  <p className="text-sm font-bold font-mono text-emerald-400">
                    {measItem.measurement.value}{measItem.unit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
