/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Area, Team, UserRole } from '../types.js';
import { api } from '../utils/api.js';
import { Layers, Users, Plus, UserCheck, HelpCircle, AlertCircle } from 'lucide-react';

interface AreaTeamManagerProps {
  areas: Area[];
  teams: Team[];
  onRefresh: () => void;
  role?: UserRole;
}

export const AreaTeamManager: React.FC<AreaTeamManagerProps> = ({ areas, teams, onRefresh, role = 'ADMIN' }) => {
  // Area creation states
  const [showAreaForm, setShowAreaForm] = useState(false);
  const [areaName, setAreaName] = useState('');
  const [areaDesc, setAreaDesc] = useState('');
  const [areaManager, setAreaManager] = useState('');

  // Team creation states
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamAreaId, setTeamAreaId] = useState(areas[0]?.id || '');
  const [teamMembers, setTeamMembers] = useState('10');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateArea = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!areaName.trim()) return setError('El nombre del área es requerido.');

    setLoading(true);
    try {
      await api.createArea({
        name: areaName.trim(),
        description: areaDesc.trim(),
        managerName: areaManager.trim() || undefined
      });
      setAreaName('');
      setAreaDesc('');
      setAreaManager('');
      setShowAreaForm(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el área.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!teamName.trim()) return setError('El nombre del equipo es obligatorio.');
    if (!teamAreaId) return setError('Asignar el equipo a un área es mandatorio.');
    if (isNaN(Number(teamMembers)) || Number(teamMembers) < 0) {
      return setError('La cantidad de miembros debe ser un número positivo.');
    }

    setLoading(true);
    try {
      await api.createTeam({
        name: teamName.trim(),
        areaId: teamAreaId,
        memberCount: Number(teamMembers)
      });
      setTeamName('');
      setTeamMembers('10');
      setShowTeamForm(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Error al registrar el equipo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upper Options */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Estructura Organizacional</h2>
          <p className="text-sm text-slate-500">
            Administra las áreas operativas e incorpora equipos tácticos del Grupo Cordillera.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {role === 'ADMIN' && (
            <button
              id="register-area-btn"
              onClick={() => {
                setError(null);
                setShowAreaForm(!showAreaForm);
                setShowTeamForm(false);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Nueva Área
            </button>
          )}
          
          {(role === 'ADMIN' || role === 'GERENTE') && (
            <button
              id="register-team-btn"
              onClick={() => {
                setError(null);
                setShowTeamForm(!showTeamForm);
                setShowAreaForm(false);
                // default select first area
                if (areas.length > 0 && !teamAreaId) setTeamAreaId(areas[0].id);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Registrar Equipo
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl flex items-start gap-2.5 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-1" />
          <span>{error}</span>
        </div>
      )}

      {/* Slide-out: Area Creation Form */}
      {showAreaForm && (
        <form onSubmit={handleCreateArea} className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 space-y-4">
          <h3 className="font-bold text-slate-950 text-sm flex items-center gap-1 bg-white inline-block px-2.5 py-1 rounded-lg border border-indigo-100">
            <Layers className="h-4 w-4 text-indigo-500" /> Formulario de Registro de Área
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre de la División Area *</label>
              <input
                id="area-name-input"
                type="text"
                placeholder="Ej: Exploración y Prospección"
                className="w-full px-3 py-2 border border-slate-300 bg-white rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 text-sm text-slate-800"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Líder / Gerente Encargado</label>
              <input
                id="area-manager-input"
                type="text"
                placeholder="Ej: Ing. Diana Cruz"
                className="w-full px-3 py-2 border border-slate-300 bg-white rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 text-sm text-slate-800"
                value={areaManager}
                onChange={(e) => setAreaManager(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cometido / Resumen Breve</label>
              <input
                id="area-desc-input"
                type="text"
                placeholder="Ej: Detección temprana y explotación óptima..."
                className="w-full px-3 py-2 border border-slate-300 bg-white rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 text-sm text-slate-800"
                value={areaDesc}
                onChange={(e) => setAreaDesc(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setShowAreaForm(false)}
              className="px-3.5 py-1.5 text-slate-500 hover:bg-slate-200 text-xs font-semibold rounded-lg"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              id="area-submit-btn"
              type="submit"
              className="bg-indigo-600 text-white text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-indigo-700"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Área'}
            </button>
          </div>
        </form>
      )}

      {/* Slide-out: Team Creation Form */}
      {showTeamForm && (
        <form onSubmit={handleCreateTeam} className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 space-y-4">
          <h3 className="font-bold text-slate-950 text-sm flex items-center gap-1 bg-white inline-block px-2.5 py-1 rounded-lg border border-emerald-100">
            <Users className="h-4 w-4 text-emerald-500" /> Formulario de Registro de Equipo
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre del Equipo *</label>
              <input
                id="team-name-input"
                type="text"
                placeholder="Ej: Cuadrilla Alfa de Perforación"
                className="w-full px-3 py-2 border border-slate-300 bg-white rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/10 text-sm text-slate-800"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Área de Pertenencia *</label>
              <select
                id="team-area-select"
                className="w-full px-3 py-2 border border-slate-300 bg-white rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/10 text-sm text-slate-800"
                value={teamAreaId}
                onChange={(e) => setTeamAreaId(e.target.value)}
                disabled={loading}
              >
                {areas.map(area => (
                  <option key={area.id} value={area.id}>{area.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Dotación (Número de Miembros)</label>
              <input
                id="team-members-input"
                type="number"
                placeholder="Ej: 14"
                className="w-full px-3 py-2 border border-slate-300 bg-white rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/10 text-sm text-slate-800"
                value={teamMembers}
                onChange={(e) => setTeamMembers(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setShowTeamForm(false)}
              className="px-3.5 py-1.5 text-slate-500 hover:bg-slate-200 text-xs font-semibold rounded-lg"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              id="team-submit-btn"
              type="submit"
              className="bg-emerald-600 text-white text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-emerald-700"
              disabled={loading}
            >
              {loading ? 'Sincronizando...' : 'Registrar Equipo'}
            </button>
          </div>
        </form>
      )}

      {/* Grid List of Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {areas.map((area) => {
          const areaTeams = teams.filter(t => t.areaId === area.id);
          const totalMembers = areaTeams.reduce((acc, curr) => acc + curr.memberCount, 0);

          return (
            <div key={area.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded-md font-bold font-mono">
                    ID: {area.id}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{area.name}</h3>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl text-slate-500">
                  <Layers className="h-5 w-5" />
                </div>
              </div>

              <p className="text-xs text-slate-600 font-sans leading-relaxed min-h-[40px]">
                {area.description || 'Sin descripción corporativa registrada.'}
              </p>

              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl">
                <UserCheck className="h-4 w-4 text-slate-400 shrink-0" />
                <div className="text-xs">
                  <div className="text-slate-400 font-medium">Líder Divisional</div>
                  <div className="font-semibold text-slate-800">{area.managerName || 'Por asignar'}</div>
                </div>
              </div>

              {/* Sub-teams List under area */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                  <span>Equipos Asociados ({areaTeams.length})</span>
                  <span>Dotación: {totalMembers}</span>
                </div>

                {areaTeams.length === 0 ? (
                  <p className="text-slate-400 text-xs font-sans italic py-2">
                    No hay equipos de trabajo en esta división.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {areaTeams.map((team) => (
                      <div key={team.id} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2 rounded-lg text-xs">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3 w-3 text-emerald-500" />
                          <span className="font-semibold text-slate-700">{team.name}</span>
                        </div>
                        <span className="bg-emerald-50 text-emerald-800 font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                          {team.memberCount} integrantes
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
