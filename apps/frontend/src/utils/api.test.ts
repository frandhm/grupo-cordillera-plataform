/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api } from './api.js';

describe('Web Application API Service Client', () => {
  // Clear mocks and state keys before/after each test execution
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should formulate API requests to prepend /api base path accurately', async () => {
    const mockJson = vi.fn().mockResolvedValueOnce([{ id: 'kpi-1', name: 'KPI Test' }]);
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: mockJson
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await api.getKpis();

    expect(mockFetch).toHaveBeenCalledWith('/api/kpis', expect.any(Object));
    expect(result).toEqual([{ id: 'kpi-1', name: 'KPI Test' }]);
  });

  it('should inject authentication headers dynamically from localStorage sessions', async () => {
    const mockSession = JSON.stringify({
      name: 'Carlos Mendoza',
      email: 'admin@grupocordillera.cl',
      role: 'ADMIN',
      initials: 'CM'
    });

    vi.mocked(localStorage.getItem).mockReturnValueOnce(mockSession);

    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce({ status: 'ok' })
    });
    vi.stubGlobal('fetch', mockFetch);

    await api.getBffDashboard();

    // Verify localStorage lookup
    expect(localStorage.getItem).toHaveBeenCalledWith('grupocordillera_session');

    // Verify correct authorization and content headers were merged in fetch options
    expect(mockFetch).toHaveBeenCalledWith('/api/bff/dashboard', {
      headers: {
        'Content-Type': 'application/json',
        'x-user-name': 'Carlos Mendoza',
        'x-user-role': 'ADMIN'
      }
    });
  });

  it('should post accurate JSON bodies during credential login', async () => {
    const mockLoginResponse = {
      success: true,
      user: {
        name: 'Diana Cruz',
        email: 'gerente@grupocordillera.cl',
        role: 'GERENTE',
        initials: 'DC'
      }
    };

    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockLoginResponse)
    });
    vi.stubGlobal('fetch', mockFetch);

    const credentials = { email: 'gerente@grupocordillera.cl', password: 'gerente111' };
    const response = await api.login(credentials);

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    expect(response).toEqual(mockLoginResponse);
  });

  it('should process backend custom errors gracefully', async () => {
    const mockErrorPayload = {
      error: 'Privilegios Insuficientes. Se requieren credenciales de Administrador.'
    };

    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      json: vi.fn().mockResolvedValueOnce(mockErrorPayload)
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(api.getLogs()).rejects.toThrow('Privilegios Insuficientes. Se requieren credenciales de Administrador.');
  });

  it('should formulate exact parameter query strings for parameterized queries like getTeams', async () => {
    const mockResponse = [{ id: 'team-1', name: 'Soporte TI', memberCount: 5 }];
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockResponse)
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await api.getTeams('area-metalurgica');

    expect(mockFetch).toHaveBeenCalledWith('/api/areas/teams?areaId=area-metalurgica', expect.any(Object));
    expect(result).toEqual(mockResponse);
  });

  it('should validate POST payload delivery when submitting metrics records', async () => {
    const mockMeasurement = { id: 'm-303', value: 12.5, date: '2026-06-11' };
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockMeasurement)
    });
    vi.stubGlobal('fetch', mockFetch);

    const data = { value: 12.5, date: '2026-06-11', notes: 'Sonda operativa' };
    await api.addKpiMeasurement('kpi-303', data);

    expect(mockFetch).toHaveBeenCalledWith('/api/kpis/kpi-303/measurements', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  });

  it('should evaluate and fallback to generic status message if json error deserialization fails', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: vi.fn().mockRejectedValueOnce(new Error('Syntax Error'))
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(api.getKpis()).rejects.toThrow('Request failed: 500 Internal Server Error');
  });
});
