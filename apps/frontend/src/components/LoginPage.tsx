/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { api } from '../utils/api.js';
import { ShieldCheck, Lock, Mail, Server, HelpCircle, ArrowRight, Activity, Cpu } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginPageProps {
  onLoginSuccess: (user: { name: string; email: string; role: 'ADMIN' | 'GERENTE' | 'VENDEDOR'; initials: string }) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor complete todos los campos.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.login({ email, password });
      if (res.success && res.user) {
        // Save to local storage for persistent session
        localStorage.setItem('grupocordillera_session', JSON.stringify(res.user));
        onLoginSuccess(res.user);
      } else {
        setError('Servicio de Autenticación no disponible.');
      }
    } catch (err: any) {
      setError(err.message || 'Error de servidores. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const selectDemoProfile = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden select-none">
      {/* Background Ambience Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-mono mb-4">
            <Cpu className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '4s' }} /> 
            <span>SISTEMA DE GOBERNANZA v2.4</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            Grupo Cordillera
          </h1>
          <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto">
            Acceso seguro al portal de indicadores operacionales y cumplimiento de metas.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-sans"
              >
                ⚠️ {error}
              </motion.div>
            )}

            <div>
              <label className="text-[10px] text-slate-400 font-mono font-bold block uppercase tracking-wider mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@grupocordillera.cl"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500/70 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-600 font-sans"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-mono font-bold block uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500/70 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-600 font-sans"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-sm shadow-emerald-900/20 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Validando Credenciales...</span>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Credentials */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider block mb-2.5">
              💡 ACCESO RÁPIDO PARA EVALUACIÓN:
            </span>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => selectDemoProfile('admin@grupocordillera.cl', 'admin123')}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/50 hover:bg-slate-950 border border-slate-850 hover:border-indigo-500/40 text-left transition-all group"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                  ADM
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-300 group-hover:text-white transition-colors">
                    Carlos Mendoza
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono">
                    Administrador (Vista Total + Logs)
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => selectDemoProfile('gerente@grupocordillera.cl', 'gerente123')}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/50 hover:bg-slate-950 border border-slate-850 hover:border-emerald-500/40 text-left transition-all group"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-[10px] font-bold text-emerald-400">
                  GTE
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-300 group-hover:text-white transition-colors">
                    Diana Cruz
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono">
                    Gerente (Vista Parcial, Sin pestaña Logs)
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => selectDemoProfile('vendedor@grupocordillera.cl', 'vendedor123')}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/50 hover:bg-slate-950 border border-slate-850 hover:border-amber-500/40 text-left transition-all group"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-[10px] font-bold text-amber-500">
                  VEN
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-300 group-hover:text-white transition-colors">
                    Felipe Silva
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono">
                    Vendedor (Métricas solamente, Sin Áreas ni Logs)
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Secure Note */}
        <p className="text-center text-[10px] text-slate-600 mt-6 flex items-center justify-center gap-1.5 font-mono">
          <ShieldCheck className="h-3.5 w-3.5 text-slate-600" /> Comunicación Encriptada TLS 1.3 • BFF Sincronizado
        </p>
      </motion.div>
    </div>
  );
};
