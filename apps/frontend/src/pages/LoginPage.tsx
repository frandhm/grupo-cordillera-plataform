import { useState } from 'react';
import { login } from '../api';

interface Props {
  onLogin: (token: string) => void;
}

export function LoginPage({ onLogin }: Props) {
  const [usuario, setUsuario] = useState('admin@cordillera.com');
  const [clave, setClave] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { access_token } = await login(usuario, clave);
      onLogin(access_token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">

      {/* Mountain silhouette SVG */}
      <div className="login-bg">
        <svg
          className="mountain-svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="xMidYMax meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,320 L0,240 L120,170 L250,210 L370,130 L480,185 L600,90 L720,160 L840,75 L960,140 L1080,65 L1200,130 L1320,60 L1440,110 L1440,320 Z"
            fill="rgba(0,212,170,0.05)"
          />
          <path
            d="M0,320 L0,275 L160,220 L320,260 L480,195 L640,245 L800,175 L960,235 L1120,165 L1280,220 L1440,175 L1440,320 Z"
            fill="rgba(0,212,170,0.035)"
          />
          <path
            d="M0,320 L0,295 L200,265 L400,285 L600,255 L800,275 L1000,250 L1200,268 L1440,248 L1440,320 Z"
            fill="rgba(0,212,170,0.02)"
          />
        </svg>
      </div>

      <div className="login-center">

        {/* Brand */}
        <div className="login-brand">
          <span className="brand-eyebrow">PLATAFORMA DE GESTIÓN</span>
          <h1 className="brand-title">CORDILLERA</h1>
          <span className="brand-sub">Grupo Empresarial · API Hub</span>
        </div>

        {/* Card */}
        <div className="login-card">
          <div className="login-card-header">
            <span className="login-icon">▲</span>
            <h2>Acceso al Sistema</h2>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="field-group">
              <label htmlFor="usuario">USUARIO</label>
              <input
                id="usuario"
                type="email"
                value={usuario}
                onChange={e => setUsuario(e.target.value)}
                placeholder=""
                autoComplete="username"
                required
              />
            </div>

            <div className="field-group">
              <label htmlFor="clave">CONTRASEÑA</label>
              <input
                id="clave"
                type="password"
                value={clave}
                onChange={e => setClave(e.target.value)}
                placeholder=""
                autoComplete="current-password"
                required
              />
            </div>

            {error && <div className="error-msg">⚠ {error}</div>}

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'VERIFICANDO...' : 'INGRESAR →'}
            </button>
          </form>

          <div className="login-footer">
            <span className="endpoint-tag">
              POST /api/auth/login · :3000
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
