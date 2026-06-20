/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { KPI } from '../types.js';
import { api } from '../utils/api.js';
import { Award, AlertCircle, X, HelpCircle } from 'lucide-react';

interface GoalFormProps {
  kpis: KPI[];
  selectedKpiId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const GoalForm: React.FC<GoalFormProps> = ({ kpis, selectedKpiId, onSuccess, onCancel }) => {
  const [kpiId, setKpiId] = useState(selectedKpiId || kpis[0]?.id || '');
  const [targetValue, setTargetValue] = useState('');
  const [operator, setOperator] = useState<'GREATER_EQUAL' | 'LESS_EQUAL' | 'EQUAL'>('GREATER_EQUAL');
  const [periodName, setPeriodName] = useState('Semestre 1 2026');
  const [periodStart, setPeriodStart] = useState('2026-01-01');
  const [periodEnd, setPeriodEnd] = useState('2026-06-30');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeKpi = kpis.find(k => k.id === kpiId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form validation
    if (!kpiId) return setError('Se requiere asociar un indicador (KPI).');
    if (!targetValue || isNaN(Number(targetValue))) return setError('El valor objetivo debe ser numérico.');
    if (!periodName.trim()) return setError('El nombre del periodo de evaluación es mandatorio.');
    if (!periodStart) return setError('La fecha de inicio de evaluación es mandatoria.');
    if (!periodEnd) return setError('La fecha de término de evaluación es mandatoria.');
    if (new Date(periodStart).getTime() > new Date(periodEnd).getTime()) {
      return setError('La fecha inicial no puede ser posterior a la fecha final.');
    }
    if (!description.trim()) return setError('La descripción/justificación de la meta es obligatoria.');

    setLoading(true);
    try {
      await api.createGoal({
        kpiId,
        targetValue: Number(targetValue),
        operator,
        periodName: periodName.trim(),
        periodStart,
        periodEnd,
        description: description.trim()
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al intentar definir la meta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="bg-amber-100 text-amber-600 p-2 rounded-lg">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-sans">Definir Meta Organizacional</h2>
            <p className="text-xs text-slate-500 font-sans">Asignar objetivos tácticos acotados temporalmente.</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl flex items-start gap-2.5 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Vincular KPI / Indicador <span className="text-red-500">*</span>
          </label>
          {selectedKpiId ? (
            <div className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium">
              {activeKpi ? `${activeKpi.name} (${activeKpi.unitOfMeasurement})` : 'Cargando...'}
            </div>
          ) : (
            <select
              id="goal-kpi-select"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-shadow outline-none text-slate-800 text-sm"
              value={kpiId}
              onChange={(e) => setKpiId(e.target.value)}
              disabled={loading}
            >
              <option value="">-- Seleccionar KPI --</option>
              {kpis.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name} ({k.unitOfMeasurement})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Operador de Tolerancia <span className="text-red-500">*</span>
            </label>
            <select
              id="goal-operator-select"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-shadow outline-none text-slate-800 text-sm"
              value={operator}
              onChange={(e) => setOperator(e.target.value as any)}
              disabled={loading}
            >
              <option value="GREATER_EQUAL">Por encima o igual (Mayor o Igual)</option>
              <option value="LESS_EQUAL">Por debajo o igual (Menor o Igual)</option>
              <option value="EQUAL">Igualdad estricta (Exactamente Igual)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Valor Objetivo (Target) <span className="text-red-500">*</span>
            </label>
            <input
              id="goal-target-input"
              type="number"
              step="any"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-shadow outline-none text-slate-800 text-sm"
              placeholder="Ej: 120"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="border border-slate-100 rounded-xl p-3.5 bg-slate-50">
          <p className="text-xs font-bold text-slate-700 mb-2 font-mono uppercase tracking-wider">
            Periodo de Evaluación
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nombre (ej: Q2 2026) <span className="text-red-500">*</span>
              </label>
              <input
                id="goal-period-name"
                type="text"
                className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none text-slate-800 text-xs"
                placeholder="Semestre 1 2026"
                value={periodName}
                onChange={(e) => setPeriodName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Fecha Inicio <span className="text-red-500">*</span>
              </label>
              <input
                id="goal-start-date"
                type="date"
                className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none text-slate-800 text-xs"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Fecha Término <span className="text-red-500">*</span>
              </label>
              <input
                id="goal-end-date"
                type="date"
                className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none text-slate-800 text-xs"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Objetivo Estratégico / Descripción <span className="text-red-500">*</span>
          </label>
          <textarea
            id="goal-desc-textarea"
            rows={2}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-shadow outline-none text-slate-800 text-sm"
            placeholder="Ej: Mantener operaciones por encima de la demanda crítica de la central termoeléctrica..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            id="goal-submit-btn"
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-medium px-5 py-2 rounded-xl text-sm shadow-sm transition-colors"
          >
            {loading ? 'Creando...' : 'Establecer Objetivo'}
          </button>
        </div>
      </form>
    </div>
  );
};
