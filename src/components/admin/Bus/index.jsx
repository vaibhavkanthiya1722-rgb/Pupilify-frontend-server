// src/components/admin/Bus/index.jsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BusController from './BusController';
import DriverManager from './drivers';
import RouteManager from './routes';
import StoppageManager from './stoppages';
import AssignmentManager from './assignments';
import FeeManager from './fees';
import LocationTracker from './location';
import PriModal from '../PriModal';
import DeleteButton from '../../common/DeleteButton';
import TableSkeleton from '../../loaders/TableSkeleton';
import PriAutocompleteSelect from '../../common/PriAutocompleteSelect';

export default function Bus({ schoolId, onToast, academicYearId, user }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('buses');

  const {
    buses,
    loading,
    form,
    modal,
    selectedBus,
    setSelectedBus,
    handleChange,
    handleSubmit,
    handleDelete,
    openModal,
    closeModal,
    loadBuses,
  } = BusController({
    schoolId,
    onToast,
    t,
  });

  const handleBusChange = (option) => {
    setSelectedBus(option || null);
  };

  const selectedBusValue = buses?.find((b) => b.id === selectedBus?.id) || null;

  // Tab configuration with icons and descriptions
  const tabs = [
    { 
      key: 'buses', 
      label: '🚌 ' + t('buses'), 
      desc: t('manageSchoolBuses') 
    },
    { 
      key: 'drivers', 
      label: '👨‍✈️ ' + t('drivers'), 
      desc: t('manageBusDrivers') 
    },
    { 
      key: 'routes', 
      label: '🗺️ ' + t('routes'), 
      desc: t('createAndManageRoutes') 
    },
    { 
      key: 'stoppages', 
      label: '📍 ' + t('stoppages'), 
      desc: t('addBusStops') 
    },
    { 
      key: 'assignments', 
      label: '👨‍🎓 ' + t('assignments'), 
      desc: t('assignStudentsToBuses') 
    },
    { 
      key: 'fees', 
      label: '💰 ' + t('fees'), 
      desc: t('manageFeeStructuresAndCollections') 
    },
    { 
      key: 'location', 
      label: '📍 ' + t('liveTracking'), 
      desc: t('trackBusLocations') 
    },
  ];

  return (
    <div className="pri-content">
      {/* Header */}
      <div className="pri-classes-header">
        <div className="mb">
          <div className="content-heading">🚌 {t('busTransportManagement')}</div>
          <div className="content-text" style={{ color: '#64748b', fontSize: 14 }}>
            {t('manageSchoolTransport')} • <strong>{buses.length}</strong> {t('buses')}
          </div>
        </div>
        <div className="d-flex gap-8">
          <button
            className="pri-btn pri-btn-primary"
            onClick={openModal}
            disabled={loading}
            style={{ borderRadius: 8, fontWeight: 600 }}
          >
            + {t('addBus')}
          </button>
        </div>
      </div>

      {/* Bus Selector - Improved */}
      {buses.length > 0 && (
        <div className="pri-filter-bar" style={{ 
          background: '#f8fafc', 
          borderRadius: 12, 
          padding: '16px 20px',
          marginBottom: 20,
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 600, color: '#1e3a5f', width: '50%' }}>
                🚌 {t('selectBus')}:
              </span>
              <PriAutocompleteSelect
                value={selectedBusValue}
                data={buses || []}
                onChange={handleBusChange}
                placeholder={t('selectBus')}
                optionLabel="registrationNo"
                optionValue="id"
                disabled={loading}
                size="medium"
                clearable
                style={{ minWidth: 250 }}
              />
            </div>
            {selectedBus && (
              <div
                style={{
                  background: '#dbeafe',
                  padding: '6px 16px',
                  borderRadius: 20,
                  fontSize: 14,
                  color: '#1e40af',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                🚌 {selectedBus.registrationNo}
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 400 }}>
                  ({t('capacity')}: {selectedBus.capacity || '-'})
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs - Improved with better styling */}
      <div className="tally-tabs" style={{ 
        marginBottom: 24, 
        display: 'flex', 
        gap: 4,
        background: '#f1f5f9',
        padding: 4,
        borderRadius: 12,
        flexWrap: 'wrap'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tally-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
            disabled={loading}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              border: 'none',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeTab === tab.key ? '#ffffff' : 'transparent',
              color: activeTab === tab.key ? '#1e3a5f' : '#64748b',
              boxShadow: activeTab === tab.key ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              flex: '0 0 auto',
            }}
          >
            {tab.label}
            <span style={{ 
              display: 'block', 
              fontSize: 10, 
              fontWeight: 400,
              color: activeTab === tab.key ? '#64748b' : '#94a3b8',
              marginTop: 2
            }}>
              {tab.desc}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content - with fade animation */}
      <div className="tab-content" style={{ animation: 'fadeIn 0.3s ease-in' }}>
        {activeTab === 'buses' && (
          <div className="pri-card" style={{ borderRadius: 12, overflow: 'hidden' }}>
            <div className="table-wrap">
              {loading && buses.length === 0 ? (
                <TableSkeleton rows={5} columns={4} />
              ) : (
                <table className="pri-table">
                  <thead style={{ background: '#f8fafc' }}>
                    <tr>
                      <th style={{ padding: '12px 16px' }}>#</th>
                      <th style={{ padding: '12px 16px' }}>{t('registrationNo')}</th>
                      <th style={{ padding: '12px 16px' }}>{t('capacity')}</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center' }}>{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buses.length === 0 ? (
                      <tr>
                        <td colSpan="4">
                          <div className="pri-empty" style={{ padding: 60 }}>
                            <div className="pri-empty-icon" style={{ fontSize: 56 }}>🚌</div>
                            <p style={{ color: '#94a3b8', marginTop: 12 }}>{t('noBusesFound')}</p>
                            <button 
                              className="pri-btn pri-btn-primary pri-btn-sm" 
                              onClick={openModal}
                              style={{ marginTop: 12 }}
                            >
                              + {t('addBus')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      buses.map((bus, index) => (
                        <tr key={bus.id} style={{ transition: 'background 0.2s' }}>
                          <td style={{ padding: '12px 16px' }}>{index + 1}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <strong style={{ color: '#1e3a5f' }}>{bus.registrationNo}</strong>
                          </td>
                          <td style={{ padding: '12px 16px' }}>{bus.capacity || '-'}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <div className="d-flex gap-8" style={{ justifyContent: 'center' }}>
                              <DeleteButton
                                objectId={bus.id}
                                objectName={bus.registrationNo}
                                onDelete={(id, name) => handleDelete(id, name, bus)}
                                itemType={t('bus')}
                                title={t('delete')}
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'drivers' && (
          <DriverManager
            schoolId={schoolId}
            buses={buses}
            onToast={onToast}
            t={t}
          />
        )}

        {activeTab === 'routes' && (
          <RouteManager
            schoolId={schoolId}
            selectedBus={selectedBus}
            onToast={onToast}
            t={t}
            onRefresh={loadBuses}
          />
        )}

        {activeTab === 'stoppages' && (
          <StoppageManager
           schoolId={schoolId}
    selectedBus={selectedBus}
    onToast={onToast}
    t={t}
    academicYearId={academicYearId} 
          />
        )}

        {activeTab === 'assignments' && (
          <AssignmentManager
            schoolId={schoolId}
            selectedBus={selectedBus}
            academicYearId={academicYearId}
            onToast={onToast}
            t={t}
          />
        )}

        {activeTab === 'fees' && (
          <FeeManager
            schoolId={schoolId}
            selectedBus={selectedBus}
            academicYearId={academicYearId}
            onToast={onToast}
            t={t}
            user={user}
          />
        )}

        {activeTab === 'location' && (
          <LocationTracker
            schoolId={schoolId}
            selectedBus={selectedBus}
            onToast={onToast}
            t={t}
            user={user}
          />
        )}
      </div>

      {/* Add Bus Modal - Improved */}
      {modal && (
        <PriModal
          title={`➕ ${t('addBus')}`}
          onClose={closeModal}
          style={{ borderRadius: 16 }}
          footer={
            <>
              <button
                className="pri-btn pri-btn-ghost"
                onClick={closeModal}
                disabled={loading}
                style={{ padding: '10px 24px' }}
              >
                {t('cancel')}
              </button>
              <button
                className="pri-btn pri-btn-primary"
                onClick={handleSubmit}
                disabled={loading}
                style={{ padding: '10px 24px', borderRadius: 8 }}
              >
                {loading ? t('saving') : t('createBus')}
              </button>
            </>
          }
        >
          <div style={{ padding: '4px 0' }}>
            <div className="pri-form-field mb-10">
              <label style={{ fontWeight: 600, color: '#1e3a5f' }}>
                {t('registrationNumber')} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="busNumber"
                value={form.busNumber}
                onChange={handleChange}
                placeholder={t('registrationNumberPlaceholder')}
                autoFocus
                disabled={loading}
                style={{ 
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  width: '100%',
                  fontSize: 14
                }}
              />
            </div>
            <div className="pri-form-field mb-10">
              <label style={{ fontWeight: 600, color: '#1e3a5f' }}>
                {t('capacity')} <span style={{ color: '#94a3b8', fontSize: 12 }}>({t('optional')})</span>
              </label>
              <input
                type="number"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                placeholder={t('capacityPlaceholder')}
                disabled={loading}
                min="1"
                style={{ 
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  width: '100%',
                  fontSize: 14
                }}
              />
            </div>
          </div>
        </PriModal>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}