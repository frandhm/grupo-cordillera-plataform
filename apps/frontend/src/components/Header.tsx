/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DashboardOverview, UserRole } from '../types.js';
import { ShieldCheck, Target, Layers, Users, BarChart3, TrendingUp, Cpu, UserCheck, X } from 'lucide-react';

interface HeaderProps {
  overview: DashboardOverview | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Header: React.FC<HeaderProps> = ({ overview, activeTab, setActiveTab, role, onRoleChange, isOpen, onClose }) => {
  // Profiles configured for testing different access levels
  const profileDetails = {
    ADMIN: {
      initials: 'CM',
      name: 'Carlos Mendoza',
      roleLabel: 'Admin Central',
      colorClass: 'bg-slate-850 text-indigo-400 border-indigo-500/50'
    },
    GERENTE: {
      initials: 'DC',
      name: 'Diana Cruz',
      roleLabel: 'Gte. Operaciones',
      colorClass: 'bg-slate-850 text-emerald-400 border-emerald-500/50'
    },
    VENDEDOR: {
      initials: 'FS',
      name: 'Felipe Silva',
      roleLabel: 'Vendedor Terreno',
      colorClass: 'bg-slate-850 text-amber-450 text-amber-500 border-amber-500/50'
    }
  };

  const currentProfile = profileDetails[role] || profileDetails.ADMIN;

  return (
    <>
      {/* Overlay background for mobile menu */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 text-slate-300 transition-transform duration-300 ease-in-out
        fixed inset-y-0 left-0 z-50 w-64 md:translate-x-0 md:static md:flex md:h-auto md:min-h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Brand Signature */}
        <div className="p-6 border-b border-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center font-display font-extrabold text-white shadow-md shadow-emerald-600/10">
              GC
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight block font-display leading-tight">
                Grupo Cordillera
              </span>
            </div>
          </div>
          {/* Mobile close button */}
          <button 
            type="button"
            onClick={onClose}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 border border-slate-800 transition-colors"
            title="Cerrar menú"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5">
        <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest px-3 mb-3 font-mono">
          Gestión Operativa
        </div>

        {[
          { id: 'dashboard', label: 'Panel de Control', icon: BarChart3, badge: overview ? `${overview.totalKpis} KPI` : undefined },
          { id: 'kpis', label: 'Indicadores (KPIs)', icon: Target, badge: overview ? `${overview.totalGoals} Metas` : undefined },
          { id: 'areas', label: 'Áreas y Equipos', icon: Layers },
          { id: 'logs', label: 'Auditoría de Logs', icon: ShieldCheck }
        ]
          .filter((tab) => {
            // Vendedores cannot view Areas & Teams tab at all
            if (role === 'VENDEDOR' && tab.id === 'areas') return false;
            // Only ADMIN can view logs tab
            if (tab.id === 'logs' && role !== 'ADMIN') return false;
            return true;
          })
          .map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`sidebar-tab-btn-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-805 text-white bg-slate-800/90 border-l-3 border-emerald-500 pl-2.5 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className="font-sans">{tab.label}</span>
                </div>
                {tab.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono ${
                    isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}

        {/* Global Performance Widget */}
        {overview && (
          <div className="pt-6 border-t border-slate-800 mt-6 px-3">
            <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-3 font-mono">
              Gobernanza
            </div>
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-sans">Meta Global</span>
                <span className="font-bold text-emerald-400 font-mono">{overview.averageGlobalCompliance}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${overview.averageGlobalCompliance}%` }}
                />
              </div>
              <div className="flex items-center gap-1.5 text-[9px] text-slate-500 pt-1 font-mono">
                <Cpu className="h-3 w-3 text-slate-500" />
                <span>Microservicios BFF: OK</span>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Interactive Role Switcher & Profile Widget */}
      <div className="p-4 border-t border-slate-850 bg-slate-950/35 space-y-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-xs font-bold font-display ${currentProfile.colorClass}`}>
            {currentProfile.initials}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-white truncate font-sans">{currentProfile.name}</div>
            <div className="text-[10px] text-slate-450 text-slate-400 truncate font-mono flex items-center gap-1">
              <UserCheck className="h-3 w-3 text-emerald-400" /> {currentProfile.roleLabel}
            </div>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Sincronizado" />
        </div>

        {/* Sign out Action button */}
        <div className="relative pt-1 border-t border-slate-800/60 font-sans">
          <button
            id="logout-button"
            onClick={() => {
              localStorage.removeItem('grupocordillera_session');
              window.location.reload();
            }}
            className="w-full text-slate-400 hover:text-rose-400 font-semibold text-[11px] py-1.5 bg-slate-900 hover:bg-rose-950/20 border border-slate-800 hover:border-rose-500/30 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            ❌ Cerrar Sesión
          </button>
        </div>
      </div>
    </aside>
    </>
  );
};
