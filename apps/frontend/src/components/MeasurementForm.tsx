/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { KPI } from '../types.js';
import { api } from '../utils/api.js';
import { TrendingUp, AlertCircle, X, CheckSquare } from 'lucide-react';

interface MeasurementFormProps {
  kpis: KPI[];
  selectedKpiId?: string; // Opt pre-selected kpi
  onSuccess: () => void;
  onCancel: () => void;
}

export const MeasurementForm: React.FC<MeasurementFormProps> = ({ kpis, selectedKpiId, onSuccess, onCancel }) => {
  const [kpiId, setKpiId] = useState(selectedKpiId || kpis[0]?.id || '');
  const [value, setValue] = useState('');
  const [date, setDate] = useState('2026-06-09'); // Preset following user current local time metadata
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeKpi = kpis.find(k => k.id === kpiId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!kpiId) return setError('Debe seleccionar un indicador.');
    if (!value || isNaN(Number(value))) return setError('Debe registrar un valor ponderable numérico.');
    if (!date) return setError('Debe indicar la fecha del registro.');

    setLoading(true);
    try {
      await api.addKpiMeasurement(kpiId, {
        value: Number(value),
        date,
        notes: notes.trim() || undefined
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la medición.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Registrar Medición</h2>
            <p className="text-xs text-slate-500 font-sans">Añadir registros cuantitativos del día.</p>
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
            Seleccionar KPI / Indicador
          </label>
          {selectedKpiId ? (
            <div className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium">
              {activeKpi ? `${activeKpi.name} (${activeKpi.unitOfMeasurement})` : 'Cargando...'}
            </div>
          ) : (
            <select
              id="measurement-kpi-select"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-shadow outline-none text-slate-800 text-sm"
              value={kpiId}
              onChange={(e) => setKpiId(e.target.value)}
              disabled={loading}
            >
              <option value="">-- Escoger Indicador --</option>
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
              Valor Registrado ({activeKpi?.unitOfMeasurement || 'Medida'}) <span className="text-red-500">*</span>
            </label>
            <input
              id="measurement-value-input"
              type="number"
              step="any"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-shadow outline-none text-slate-800 text-sm"
              placeholder="Ej: 125.4"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Fecha de la Medición <span className="text-red-500">*</span>
            </label>
            <input
              id="measurement-date-input"
              type="date"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-shadow outline-none text-slate-800 text-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Comentarios / Bitácora Operacional
          </label>
          <textarea
            id="measurement-notes-textarea"
            rows={2}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-shadow outline-none text-slate-800 text-sm"
            placeholder="Anotaciones de contexto (ej: Clima adverso, turno de noche, etc.)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
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
            id="measurement-submit-btn"
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-medium px-5 py-2 rounded-xl text-sm shadow-sm transition-colors"
          >
            {loading ? 'Sincronizando...' : 'Registrar'}
          </button>
        </div>
      </form>
    </div>
  );
};
