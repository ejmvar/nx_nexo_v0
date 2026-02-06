'use client';

import { useEffect, useState } from 'react';
import { checkHealth } from '../../lib/api-client';
import { API_CONFIG, API_ENDPOINTS } from '../../lib/api-config';

interface HealthStatus {
  authService: boolean;
  crmService: boolean;
  timestamp: string;
}

export default function HealthCheckPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    performHealthCheck();
    // Auto-refresh every 10 seconds
    const interval = setInterval(performHealthCheck, 10000);
    return () => clearInterval(interval);
  }, []);

  const performHealthCheck = async () => {
    try {
      setLoading(true);
      setError(null);
      const status = await checkHealth();
      setHealth(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Health check failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (status: boolean) => {
    return status ? '✅' : '❌';
  };

  const getStatusBg = (status: boolean) => {
    return status ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            System Health Check
          </h1>
          <p className="text-gray-600">
            Monitor the status of backend services
          </p>
        </div>

        {/* Configuration Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📡 Configuration
          </h2>
          <div className="space-y-2 text-sm font-mono bg-gray-50 p-4 rounded">
            <div><span className="text-gray-600">Auth Service URL:</span> <span className="text-blue-600">{API_CONFIG.AUTH_SERVICE_URL}</span></div>
            <div><span className="text-gray-600">CRM Service URL:</span> <span className="text-blue-600">{API_CONFIG.CRM_SERVICE_URL}</span></div>
            <div><span className="text-gray-600">Timeout:</span> <span className="text-gray-900">{API_CONFIG.TIMEOUT}ms</span></div>
          </div>
        </div>

        {/* Service Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              🔍 Service Status
            </h2>
            <button
              onClick={performHealthCheck}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? '🔄 Checking...' : '🔄 Refresh'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 font-semibold">❌ Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {health && (
            <div className="space-y-4">
              {/* Auth Service Status */}
              <div className={`border rounded-lg p-4 ${getStatusBg(health.authService)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getStatusIcon(health.authService)} Auth Service
                    </h3>
                    <p className="text-sm text-gray-600 font-mono mt-1">
                      {API_ENDPOINTS.HEALTH.AUTH_SERVICE}
                    </p>
                  </div>
                  <span className={`text-2xl font-bold ${getStatusColor(health.authService)}`}>
                    {health.authService ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
              </div>

              {/* CRM Service Status */}
              <div className={`border rounded-lg p-4 ${getStatusBg(health.crmService)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getStatusIcon(health.crmService)} CRM Service
                    </h3>
                    <p className="text-sm text-gray-600 font-mono mt-1">
                      {API_ENDPOINTS.HEALTH.CRM_SERVICE}
                    </p>
                  </div>
                  <span className={`text-2xl font-bold ${getStatusColor(health.crmService)}`}>
                    {health.crmService ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
              </div>

              {/* Overall Status */}
              <div className="bg-gray-50 rounded-lg p-4 mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Overall System Status
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Last checked: {new Date(health.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    {health.authService && health.crmService ? (
                      <div className="text-green-600 font-bold text-xl">
                        ✅ ALL SYSTEMS OPERATIONAL
                      </div>
                    ) : (
                      <div className="text-red-600 font-bold text-xl">
                        ⚠️ SERVICES DOWN
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!health && !loading && !error && (
            <div className="text-center text-gray-500 py-8">
              Click "Refresh" to check service status
            </div>
          )}
        </div>

        {/* Available Endpoints */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📚 Available Endpoints
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(API_ENDPOINTS.CRM).map(([key, url]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-3">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  {key.charAt(0) + key.slice(1).toLowerCase()}
                </h3>
                <p className="text-xs text-gray-600 font-mono break-all">
                  {url}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            ← Back to Portal Selection
          </a>
        </div>
      </div>
    </div>
  );
}
