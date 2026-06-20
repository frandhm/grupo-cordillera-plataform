/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { KPI, Area } from '../types.js';
import { api } from '../utils/api.js';
import { Edit3, AlertCircle, X } from 'lucide-react';

interface KpiEditFormProps {
  kpi: KPI;
  areas: Area[];
  onSuccess: () => void;
  onCancel: () => void;
}

export const KpiEditForm: React.FC<KpiEditFormProps> = ({ kpi, areas, onSuccess, onCancel }) => {
  const [name, setName] = useState(kpi.name);
  const [description, setDescription] = useState(kpi.description);
  const [unitOfMeasurement, setUnitOfMeasurement] = useState(kpi.unitOfMeasurement);
  const [areaId, setAreaId] = useState(kpi.areaId);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(kpi.name);
    setDescription(kpi.description);
    setUnitOfMeasurement(kpi.unitOfMeasurement);
    setAreaId(kpi.areaId);
  }, [kpi]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError('El nombre del KPI es requerido.');
    if (!description.trim()) return setError('La descripción del KPI es requerida.');
    if (!unitOfMeasurement.trim()) return setError('La unidad de medida es requerida.');

    setLoading(true);
    try {
      await api.updateKpi(kpi.id, {
        name: name.trim(),
        description: description.trim(),
        unitOfMeasurement: unitOfMeasurement.trim(),
        areaId,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al intentar actualizar el KPI.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
            <Edit3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Editar KPI</h2>
            <p className="text-xs text-slate-500 font-sans">Nivel: {kpi.id}</p>
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
            Nombre del KPI <span className="text-red-500">*</span>
          </label>
          <input
            id="edit-name-input"
            type="text"
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-shadow outline-none text-slate-800 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Descripción Detallada <span className="text-red-500">*</span>
          </label>
          <textarea
            id="edit-desc-textarea"
            rows={3}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-shadow outline-none text-slate-800 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Unidad de Medida <span className="text-red-500">*</span>
            </label>
            <select
              id="edit-unit-select"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-shadow outline-none text-slate-800 text-sm"
              value={unitOfMeasurement}
              onChange={(e) => setUnitOfMeasurement(e.target.value)}
              disabled={loading}
            >
              <option value="%">Porcentaje (%)</option>
              <option value="Tons">Toneladas (Tons)</option>
              <option value="MWh">Megavatios Hora (MWh)</option>
              <option value="IF">Índice de Frecuencia (IF)</option>
              <option value="USD">Dólares (USD)</option>
              <option value="Horas">Horas (Horas)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Área de Control <span className="text-red-500">*</span>
            </label>
            <select
              id="edit-area-select"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-shadow outline-none text-slate-800 text-sm"
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              disabled={loading}
            >
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-150">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            id="edit-kpi-submit"
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-medium px-5 py-2 rounded-xl text-sm shadow-sm transition-colors"
          >
            {loading ? 'Actualizando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};
