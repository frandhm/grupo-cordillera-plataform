/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { api } from './utils/api.js';
import { DashboardOverview, KpiDetailedInfo, Area, Team, KPI, UserRole } from './types.js';
import { Header } from './components/Header.tsx';
import { KPIDashboard } from './components/KPIDashboard.tsx';
import { AreaTeamManager } from './components/AreaTeamManager.tsx';
import { KpiForm } from './components/KpiForm.tsx';
import { KpiEditForm } from './components/KpiEditForm.tsx';
import { MeasurementForm } from './components/MeasurementForm.tsx';
import { GoalForm } from './components/GoalForm.tsx';
import { LoginPage } from './components/LoginPage.tsx';
import { LogsPanel } from './components/LogsPanel.tsx';
import { ShieldAlert, Compass, ServerCrash, RefreshCw, Menu } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [role, setRole] = useState<UserRole>(() => {
    try {
      const session = localStorage.getItem('grupocordillera_session');
      if (session) {
        const parsed = JSON.parse(session);
        return parsed.role || 'ADMIN';
      }
    } catch {}
    return 'ADMIN';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const s = localStorage.getItem('grupocordillera_session');
      return !!s;
    } catch {
      return false;
    }
  });

  const [user, setUser] = useState<{ name: string; email: string; role: UserRole; initials: string } | null>(() => {
    try {
      const s = localStorage.getItem('grupocordillera_session');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  
  // Loaded BFF States
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [detailedKpis, setDetailedKpis] = useState<KpiDetailedInfo[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  
  // UI & Loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Overlay forms states
  const [modalType, setModalType] = useState<'NONE' | 'CREATE_KPI' | 'EDIT_KPI' | 'ADD_MEASUREMENT' | 'ADD_GOAL'>('NONE');
  const [targetKpiId, setTargetKpiId] = useState<string | undefined>(undefined);
  const [targetKpi, setTargetKpi] = useState<KPI | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core Data Fetch Orchestration
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Parallelize independent fetch queries
      const [overviewRes, detailedKpisRes, areasRes, teamsRes] = await Promise.all([
        api.getBffDashboard(),
        api.getBffKpisDetailed(),
        api.getAreas(),
        api.getTeams()
      ]);
      
      setOverview(overviewRes);
      setDetailedKpis(detailedKpisRes);
      setAreas(areasRes);
      setTeams(teamsRes);
    } catch (err: any) {
      console.error('Error fetching BFF aggregates:', err);
      setError(err.message || 'No se pudo conectar de manera estable con el microservicio Backend (BFF).');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Success actions
  const handleSuccessAction = () => {
    setModalType('NONE');
    setTargetKpiId(undefined);
    setTargetKpi(undefined);
    fetchAllData();
  };

  // Pre-selected trigger helpers
  const triggerAddMeasurement = (kpiId: string) => {
    setTargetKpiId(kpiId);
    setModalType('ADD_MEASUREMENT');
  };

  const triggerAddGoal = (kpiId: string) => {
    setTargetKpiId(kpiId);
    setModalType('ADD_GOAL');
  };

  const triggerEditKpi = (kpi: KPI) => {
    setTargetKpi(kpi);
    setModalType('EDIT_KPI');
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    const profiles = {
      ADMIN: { name: 'Carlos Mendoza', email: 'admin@grupocordillera.cl', role: 'ADMIN', initials: 'CM' },
      GERENTE: { name: 'Diana Cruz', email: 'gerente@grupocordillera.cl', role: 'GERENTE', initials: 'DC' },
      VENDEDOR: { name: 'Felipe Silva', email: 'vendedor@grupocordillera.cl', role: 'VENDEDOR', initials: 'FS' }
    };
    const activeProf = profiles[newRole];
    setUser(activeProf as any);
    localStorage.setItem('grupocordillera_session', JSON.stringify(activeProf));
  };

  if (!isAuthenticated) {
    return (
      <LoginPage 
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          setRole(loggedInUser.role);
          setIsAuthenticated(true);
          fetchAllData();
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans selection:bg-emerald-500/20 antialiased">
      <Header 
        overview={overview} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        role={role} 
        onRoleChange={handleRoleChange} 
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 min-h-screen flex flex-col overflow-y-auto">
        {/* Sleek Professional Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors"
              title="Abrir menú"
              type="button"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xs font-bold text-slate-500 font-sans tracking-widest uppercase">
                {activeTab === 'dashboard' && 'Panel de Control Operacional'}
                {activeTab === 'kpis' && 'Gobernanza y KPIs de Desempeño'}
                {activeTab === 'areas' && 'Estructura e Integraciones Organizacionales'}
                {activeTab === 'logs' && 'Auditoría de Acciones y Seguridad (Logs)'}
              </h1>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Grupo Cordillera • Plataforma Inteligente de Monitoreo
              </p>
            </div>
          </div>
          {/* Right side of header is left empty or minimal */}
        </header>

        <main className="flex-1 p-8 space-y-6 max-w-7xl w-full mx-auto">
          {loading && !overview ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw className="h-10 w-10 text-emerald-600 animate-spin mb-4" />
              <h2 className="text-slate-800 font-semibold font-display">Cargando Plataforma de Monitoreo...</h2>
              <p className="text-slate-500 text-xs mt-1 font-mono">Conectándose a las pasarelas del BFF Gateway...</p>
            </div>
          ) : error ? (
            <div className="max-w-md mx-auto text-center border border-slate-200 bg-white rounded-3xl p-8 shadow-sm">
              <ServerCrash className="h-12 w-12 text-rose-500 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-slate-800">Fallo de Comunicación</h2>
              <p className="text-xs text-slate-500 font-sans mt-2 leading-relaxed">
                {error}
              </p>
              <button
                onClick={fetchAllData}
                className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
              >
                <RefreshCw className="h-3 w-3" /> Intentar Sincronizar
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* View Switching */}
              {activeTab === 'dashboard' && (
                <KPIDashboard
                  overview={overview}
                  detailedKpis={detailedKpis}
                  areas={areas}
                  onAddMeasurement={triggerAddMeasurement}
                  onAddGoal={triggerAddGoal}
                  onEditKpi={triggerEditKpi}
                  onOpenCreateKpi={() => setModalType('CREATE_KPI')}
                  onOpenCreateMeasurement={() => setModalType('ADD_MEASUREMENT')}
                  onOpenCreateGoal={() => setModalType('ADD_GOAL')}
                  role={role}
                />
              )}

              {activeTab === 'kpis' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-2 border-b border-slate-200">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 font-display">Módulo de KPIs Corporativos</h2>
                      <p className="text-xs text-slate-500 font-sans">
                        Lista integral de indicadores operacionales y de seguridad del Grupo Cordillera.
                      </p>
                    </div>
                    {role !== 'VENDEDOR' && (
                      <button
                        onClick={() => setModalType('CREATE_KPI')}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
                      >
                        + Nuevo Indicador (KPI)
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {detailedKpis.map((detailed) => (
                      <div key={detailed.kpi.id} className="relative">
                        <KPIDashboard
                          overview={null}
                          detailedKpis={[detailed]}
                          areas={areas}
                          onAddMeasurement={triggerAddMeasurement}
                          onAddGoal={triggerAddGoal}
                          onEditKpi={triggerEditKpi}
                          onOpenCreateKpi={() => setModalType('CREATE_KPI')}
                          onOpenCreateMeasurement={() => setModalType('ADD_MEASUREMENT')}
                          onOpenCreateGoal={() => setModalType('ADD_GOAL')}
                          role={role}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'areas' && (
                <AreaTeamManager areas={areas} teams={teams} onRefresh={fetchAllData} role={role} />
              )}

              {activeTab === 'logs' && (
                <LogsPanel role={role} />
              )}


            </div>
          )}
        </main>

        {/* FOOTER */}
        <footer className="bg-white text-slate-400 border-t border-slate-200 py-5 text-center text-xs font-sans">
          <div className="max-w-7xl mx-auto px-4">
            <p className="font-semibold text-slate-500 font-display">© 2026 Grupo Cordillera. Todos los derechos reservados.</p>
            <p className="mt-1 text-[10px] text-slate-400 font-mono">
              Arquitectura de Microservicios Desplegada: Gestión de KPIs • Gestión de Metas • Control de Áreas/Equipos • Integración BFF.
            </p>
          </div>
        </footer>
      </div>


      {/* GLOBAL DIALOG WORKFLOW OVERLAY */}
      {modalType !== 'NONE' && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-lg my-8 animate-in fade-in zoom-in-95 duration-150">
            
            {modalType === 'CREATE_KPI' && (
              <KpiForm
                areas={areas}
                onSuccess={handleSuccessAction}
                onCancel={() => setModalType('NONE')}
              />
            )}

            {modalType === 'EDIT_KPI' && targetKpi && (
              <KpiEditForm
                kpi={targetKpi}
                areas={areas}
                onSuccess={handleSuccessAction}
                onCancel={() => setModalType('NONE')}
              />
            )}

            {modalType === 'ADD_MEASUREMENT' && (
              <MeasurementForm
                kpis={detailedKpis.map(d => d.kpi)}
                selectedKpiId={targetKpiId}
                onSuccess={handleSuccessAction}
                onCancel={() => {
                  setModalType('NONE');
                  setTargetKpiId(undefined);
                }}
              />
            )}

            {modalType === 'ADD_GOAL' && (
              <GoalForm
                kpis={detailedKpis.map(d => d.kpi)}
                selectedKpiId={targetKpiId}
                onSuccess={handleSuccessAction}
                onCancel={() => {
                  setModalType('NONE');
                  setTargetKpiId(undefined);
                }}
              />
            )}

          </div>
        </div>
      )}
    </div>
  );
}
