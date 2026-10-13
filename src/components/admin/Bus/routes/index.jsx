// src/components/admin/Bus/routes/index.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import BusService from '../../../../services/BusService';
import PriModal from '../../../admin/PriModal';
import DeleteButton from '../../../common/DeleteButton';

export default function RouteManager({ schoolId, selectedBus, onToast, onRefresh }) {
  const { t } = useTranslation();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ routeName: '' });

  const loadRoutes = useCallback(async () => {
    if (!selectedBus?.id) return;
    setLoading(true);
    try {
      const response = await BusService.getRoutesByBus(schoolId, selectedBus.id);
      const data = response?.data || response || [];
      setRoutes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Error loading routes:', err);
      onToast?.(t('errorLoadingRoutes'), 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedBus, schoolId, onToast, t]);

  useEffect(() => {
    if (selectedBus?.id && schoolId) loadRoutes();
  }, [selectedBus, schoolId, loadRoutes]);

  const handleSubmit = async () => {
    if (!form.routeName.trim()) {
      onToast?.(t('routeNameRequired'), 'error');
      return;
    }
    setLoading(true);
    try {
      await BusService.createRoute(schoolId, selectedBus.id, form.routeName.trim());
      onToast?.(t('routeCreatedSuccess'), 'success');
      setModal(false);
      setForm({ routeName: '' });
      await loadRoutes();
      onRefresh?.();
    } catch (err) {
      console.error('❌ Error creating route:', err);
      onToast?.(t('errorCreatingRoute'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (routeId, routeName) => {
    if (!window.confirm(t('deleteRouteConfirm', { routeName }))) return;
    setLoading(true);
    try {
      await BusService.deleteRoute(schoolId, routeId);
      onToast?.(t('routeDeletedSuccess'), 'success');
      await loadRoutes();
    } catch (err) {
      console.error('❌ Error deleting route:', err);
      onToast?.(t('errorDeletingRoute'), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedBus) {
    return (
      <div className="pri-card" style={{ padding: 40 }}>
        <div className="pri-empty">
          <div className="pri-empty-icon">🗺️</div>
          <p>{t('pleaseSelectBus')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pri-card" style={{ padding: '10px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <div>
          <h3 style={{ margin: 0, color: '#1e3a5f' }}>
            🗺️ {t('routesFor')} {selectedBus.registrationNo}
          </h3>
          <span style={{ fontSize: 13, color: '#64748b' }}>
            {routes.length} {t('routes')}
          </span>
        </div>
        <button
          className="pri-btn pri-btn-primary pri-btn-sm"
          onClick={() => {
            setModal(true);
            setForm({ routeName: '' });
          }}
          disabled={loading}
        >
          + {t('addRoute')}
        </button>
      </div>

      <div
        className="route-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {routes.map((route) => (
          <div
            key={route.id}
            style={{
              background: '#f8fafc',
              borderRadius: 8,
              padding: 16,
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: '#1e3a5f' }}>🗺️ {route.routeName}</h4>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  {route.stoppages?.length || 0} {t('stoppages')}
                </span>
              </div>
              <DeleteButton
                objectId={route.id}
                objectName={route.routeName}
                onDelete={handleDelete}
                itemType={t('route')}
                title={t('delete')}
                icon="🗑️"
              />
            </div>
            {route.stoppages?.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  📍 {t('stoppages')}:
                </div>
                {route.stoppages.slice(0, 3).map((stop, idx) => (
                  <div
                    key={stop.id}
                    style={{
                      fontSize: 13,
                      padding: '4px 8px',
                      background: 'white',
                      borderRadius: 4,
                      marginBottom: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>
                      {idx + 1}. {stop.stopName}
                    </span>
                  
                  </div>
                ))}
                {route.stoppages.length > 3 && (
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                    +{route.stoppages.length - 3} {t('more')}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {routes.length === 0 && !loading && (
          <div
            style={{
              gridColumn: '1 / -1',
              padding: 40,
              textAlign: 'center',
              color: '#94a3b8',
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 8 }}>🗺️</div>
            <p>{t('noRoutesFound')}</p>
          </div>
        )}
      </div>

      {/* Add Route Modal */}
      {modal && (
        <PriModal
          title={`➕ ${t('addRoute')} - ${selectedBus.registrationNo}`}
          onClose={() => {
            setModal(false);
            setForm({ routeName: '' });
          }}
          footer={
            <>
              <button
                className="pri-btn pri-btn-ghost"
                onClick={() => {
                  setModal(false);
                  setForm({ routeName: '' });
                }}
                disabled={loading}
              >
                {t('cancel')}
              </button>
              <button className="pri-btn pri-btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? t('saving') : t('createRoute')}
              </button>
            </>
          }
        >
          <div className="pri-form-field">
            <label>{t('routeName')} *</label>
            <input
              type="text"
              value={form.routeName}
              onChange={(e) => setForm({ routeName: e.target.value })}
              placeholder={t('routeNamePlaceholder')}
              autoFocus
              disabled={loading}
            />
          </div>
        </PriModal>
      )}
    </div>
  );
}