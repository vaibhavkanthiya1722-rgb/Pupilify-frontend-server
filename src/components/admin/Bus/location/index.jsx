// src/components/admin/Bus/location/index.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import BusService from '../../../../services/BusService';
import TableSkeleton from '../../../loaders/TableSkeleton';

export default function LocationTracker({ schoolId, selectedBus, onToast }) {
  const { t } = useTranslation();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadLocations = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const response = await BusService.getActiveBusLocations(schoolId);
        const data = response?.data || response || [];
        setLocations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('❌ Error loading locations:', err);
        if (!silent) onToast?.(t('errorLoadingLocations'), 'error');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [schoolId, onToast, t]
  );

  useEffect(() => {
    if (schoolId) loadLocations();
  }, [schoolId, loadLocations]);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => loadLocations(true), 15000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, loadLocations]);

  const getStatusColor = (isActive) => (isActive ? '#22c55e' : '#94a3b8');
  const getStatusText = (isActive) => (isActive ? t('active') : t('inactive'));

  const formatTime = (timestamp) => {
    if (!timestamp) return '—';
    try {
      return new Date(timestamp).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return '—';
    }
  };

  const displayLocations = selectedBus
    ? locations.filter((loc) => loc.busId === selectedBus.id)
    : locations;

  const selectedBusLocation = selectedBus
    ? locations.find((loc) => loc.busId === selectedBus.id)
    : null;

  return (
    <div className="pri-card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 10,
          padding: '10px',
        }}
      >
        <div>
          <h3 style={{ margin: 0, color: '#1e3a5f' }}>📍 {t('liveBusTracking')}</h3>
          <span style={{ fontSize: 13, color: '#64748b' }}>
            {locations.length} {t('busesActive')}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            {t('autoRefresh')}
          </label>
          <button
            className="pri-btn pri-btn-ghost pri-btn-sm"
            onClick={() => loadLocations()}
            disabled={loading}
          >
            ↻ {t('refresh')}
          </button>
        </div>
      </div>

      {selectedBus && selectedBusLocation && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 16,
            display: 'flex',
            gap: 20,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <span style={{ fontSize: 12, color: '#64748b' }}>{t('bus')}</span>
            <div style={{ fontWeight: 700 }}>🚌 {selectedBus.registrationNo}</div>
          </div>
          <div>
            <span style={{ fontSize: 12, color: '#64748b' }}>{t('status')}</span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 600,
                color: getStatusColor(selectedBusLocation.trackingActive),
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: getStatusColor(selectedBusLocation.trackingActive),
                  animation: selectedBusLocation.trackingActive ? 'pulse 1.5s infinite' : 'none',
                }}
              />
              {getStatusText(selectedBusLocation.trackingActive)}
            </div>
          </div>
          <div>
            <span style={{ fontSize: 12, color: '#64748b' }}>{t('lastUpdated')}</span>
            <div style={{ fontWeight: 600 }}>
              {formatTime(selectedBusLocation.lastLocation?.timestamp || selectedBusLocation.updatedAt)}
            </div>
          </div>
          {selectedBusLocation.lastLocation && (
            <div>
              <span style={{ fontSize: 12, color: '#64748b' }}>{t('location')}</span>
              <div style={{ fontWeight: 600 }}>
                📍 {selectedBusLocation.lastLocation.latitude?.toFixed(6)},{' '}
                {selectedBusLocation.lastLocation.longitude?.toFixed(6)}
              </div>
            </div>
          )}
          {selectedBusLocation.lastLocation?.speed !== undefined && (
            <div>
              <span style={{ fontSize: 12, color: '#64748b' }}>{t('speed')}</span>
              <div style={{ fontWeight: 600 }}>
                🏎️ {selectedBusLocation.lastLocation.speed} km/h
              </div>
            </div>
          )}
        </div>
      )}

      <div className="table-wrap">
        {loading && locations.length === 0 ? (
          <TableSkeleton rows={5} columns={6} />
        ) : (
          <table className="pri-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t('bus')}</th>
                <th>{t('driver')}</th>
                <th>{t('status')}</th>
                <th>{t('lastUpdated')}</th>
                <th>{t('location')}</th>
              </tr>
            </thead>
            <tbody>
              {displayLocations.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="pri-empty">
                      <div className="pri-empty-icon">📍</div>
                      <p>{t('noActiveBuses')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayLocations.map((loc, index) => (
                  <tr key={loc.id || index}>
                    <td>{index + 1}</td>
                    <td>
                      <div>
                        <strong>{loc.bus?.registrationNo || loc.busId}</strong>
                        {loc.isTrackingActive && (
                          <span
                            style={{
                              display: 'inline-block',
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: '#22c55e',
                              marginLeft: 6,
                            }}
                          />
                        )}
                      </div>
                    </td>
                    <td>{loc.bus?.driverName || '-'}</td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '2px 10px',
                          borderRadius: 12,
                          fontSize: 12,
                          background: loc.isTrackingActive ? '#dcfce7' : '#f1f5f9',
                          color: loc.isTrackingActive ? '#166534' : '#64748b',
                        }}
                      >
                        {loc.isTrackingActive ? '🟢' : '⚪'} {getStatusText(loc.isTrackingActive)}
                      </span>
                    </td>
                    <td>{formatTime(loc.lastLocation?.timestamp || loc.updatedAt)}</td>
                    <td>
                      {loc.lastLocation ? (
                        <span style={{ fontSize: 12 }}>
                          📍 {loc.lastLocation.latitude?.toFixed(5)},{' '}
                          {loc.lastLocation.longitude?.toFixed(5)}
                          {loc.lastLocation.speed && (
                            <span style={{ color: '#64748b', marginLeft: 6 }}>
                              ({loc.lastLocation.speed} km/h)
                            </span>
                          )}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}