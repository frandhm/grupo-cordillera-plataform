import { useState } from 'react';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

export default function App() {
  const [token, setToken] = useState<string | null>(null);

  return token
    ? <DashboardPage token={token} onLogout={() => setToken(null)} />
    : <LoginPage onLogin={setToken} />;
}
