import { useState, useCallback } from 'react';

export function useAsyncData<T>(loader: () => Promise<T>, deps: unknown[]) {
  const [data, setData]       = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setData(await loader()); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, load, setData };
}

export function decodeToken(t: string): { email: string; role: string } {
  try { return JSON.parse(atob(t.split('.')[1])); }
  catch { return { email: 'usuario', role: 'admin' }; }
}
