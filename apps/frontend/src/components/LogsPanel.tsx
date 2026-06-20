/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../utils/api.js';
import { AuditLog, UserRole } from '../types.js';
import { FileText, Search, RefreshCw, Layers, Shield, UserCheck, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface LogsPanelProps {
  role: UserRole;
}

export const LogsPanel: React.FC<LogsPanelProps> = ({ role }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getLogs();
      setLogs(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al descargar bitácora de auditoría.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'ADMIN') {
      fetchLogs();
    }
  }, [role]);

  // Derived filter operations
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const matchesRole = roleFilter === 'ALL' || log.role === roleFilter;

    return matchesSearch && matchesAction && matchesRole;
  });

  // Role Badge Styles
  const getRoleBadge = (logRole: UserRole) => {
    switch (logRole) {
      case 'ADMIN':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">👑 ADMIN</span>;
      case 'GERENTE':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">💼 GERENTE</span>;
      case 'VENDEDOR':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-amber-500/10 text-amber-500 border border-amber-500/20">🛒 VENDEDOR</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-slate-800 text-slate-400">{logRole}</span>;
    }
  };

  // Action Theme Styles
  const getActionBadgeClass = (action: string) => {
    if (action.includes('Creación') || action.includes('nuevo') || action.includes('Registro')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15';
    }
    if (action.includes('Edición') || action.includes('Actualización')) {
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/15';
    }
    if (action.includes('Inicio')) {
      return 'bg-sky-500/10 text-sky-400 border-sky-500/15';
    }
    return 'bg-slate-800/80 text-slate-350 border-slate-750';
  };

  if (role !== 'ADMIN') {
    return (
      <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200 text-center max-w-lg mx-auto my-12">
        <Shield className="h-12 w-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-base font-bold text-slate-800">Privilegios Insuficientes</h3>
        <p className="text-xs text-slate-500 mt-2">
          La bitácora de auditoría de logs es de acceso confidencial y está restringida únicamente a perfiles con el rol de <strong>Administrador (ADMIN)</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upper Context Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-sans flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-600" /> Bitácora de Auditoría (Logs de Sistema)
          </h2>
          <p className="text-xs text-slate-500">
            Registro inmutable de actividades administrativas, ingresos de métricas y sincronización de microservicios.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refrescar Registro</span>
        </button>
      </div>

      {/* Log Overview Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold font-mono uppercase tracking-wider">Total Registros</div>
            <div className="text-lg font-bold text-slate-800">{logs.length}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold font-mono uppercase tracking-wider">Escrituras (Crear/Editar)</div>
            <div className="text-lg font-bold text-slate-800">
              {logs.filter(l => l.action.includes('Creación') || l.action.includes('Edición') || l.action.includes('Registro') || l.action.includes('Asociación')).length}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold font-mono uppercase tracking-wider">Inicios de Sesión</div>
            <div className="text-lg font-bold text-slate-800">
              {logs.filter(l => l.action === 'Inicio de Sesión').length}
            </div>
          </div>
        </div>
      </div>

      {/* Filtering Controls */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3.5">
          {/* Search bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por usuario, acción o detalles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-indigo-500 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-700 outline-none transition-all placeholder:text-slate-400 font-sans"
            />
          </div>

          {/* Action Filter */}
          <div className="w-full md:w-52">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer font-sans"
            >
              <option value="ALL">🔍 Todas las Acciones</option>
              <option value="Inicio de Sesión">🔑 Inicios de Sesión</option>
              <option value="Creación de KPI">📈 Creación de KPIs</option>
              <option value="Edición de KPI">✏️ Edición de KPIs</option>
              <option value="Registro de Medición">📊 Registros de Métricas</option>
              <option value="Asociación de Meta">🥅 Asociación de Metas</option>
              <option value="Creación de Área">🧱 Creaciones de Áreas</option>
              <option value="Registro de Equipo">👥 Registros de Equipos</option>
            </select>
          </div>

          {/* Role Filter */}
          <div className="w-full md:w-44">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer font-sans"
            >
              <option value="ALL">👤 Todos los Roles</option>
              <option value="ADMIN">👑 Administrador</option>
              <option value="GERENTE">💼 Gerente</option>
              <option value="VENDEDOR">🛒 Vendedor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table Output */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-slate-350 mb-3" />
            <span>Descargando bitácora de auditoría en tiempo real...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-500 text-xs bg-rose-500/5 border border-rose-100 rounded-2xl m-4">
            {error}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <span>No se encontraron eventos coincidentes con los filtros seleccionados.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] text-slate-450 text-slate-500 uppercase tracking-wider font-mono font-bold">
                  <th className="py-3 px-4">Estampa Temporal</th>
                  <th className="py-3 px-4">Operario</th>
                  <th className="py-3 px-4">Rol</th>
                  <th className="py-3 px-4">Acción Auditada</th>
                  <th className="py-3 px-4">Detalle Operacional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-sans">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-450 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('es-CL', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    {/* User and Role */}
                    <td className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">
                      {log.user}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getRoleBadge(log.role)}
                    </td>
                    {/* Action Tag */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getActionBadgeClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    {/* Details Column */}
                    <td className="py-3 px-4 text-slate-500 max-w-sm break-words">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
