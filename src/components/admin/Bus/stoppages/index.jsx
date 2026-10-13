// src/components/admin/Bus/stoppages/index.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import BusService from '../../../../services/BusService';
import PriModal from '../../../admin/PriModal';
import DeleteButton from '../../../common/DeleteButton';
import TableSkeleton from '../../../loaders/TableSkeleton';
import EditAndViewButton from '../../../common/EditAndViewButton';
import ConfirmationDialog from '../../../common/table-componets/confirmation-dialog';

export default function StoppageManager({ schoolId, selectedBus, onToast, academicYearId }) {
  const { t } = useTranslation();
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [stoppages, setStoppages] = useState([]);
  const [feeStructures, setFeeStructures] = useState({});
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [editingStoppage, setEditingStoppage] = useState(null);
  const [form, setForm] = useState({ stopName: '' });
  
  // Fee Structure Modal
  const [feeModal, setFeeModal] = useState(false);
  const [selectedStoppageForFee, setSelectedStoppageForFee] = useState(null);
  const [feeStructureForm, setFeeStructureForm] = useState({
    monthlyFeeAmount: '',
    totalMonths: 12,
  });
  const [feeLoading, setFeeLoading] = useState(false);

  // Confirmation Dialog
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
    loading: false,
  });

  // Load routes
  const loadRoutes = useCallback(async () => {
    if (!selectedBus?.id) return;
    setLoading(true);
    try {
      const response = await BusService.getRoutesByBus(schoolId, selectedBus.id);
      const data = response?.data || response || [];
      setRoutes(Array.isArray(data) ? data : []);
      if (data.length > 0 && !selectedRoute) setSelectedRoute(data[0]);
    } catch (err) {
      console.error('❌ Error loading routes:', err);
      onToast?.(t('errorLoadingRoutes'), 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedBus, schoolId, selectedRoute, onToast, t]);

  // Load stoppages
  const loadStoppages = useCallback(async () => {
    if (!selectedRoute?.id) return;
    setLoading(true);
    try {
      const response = await BusService.getStoppagesByRoute(schoolId, selectedRoute.id);
      const data = response?.data || response || [];
      setStoppages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Error loading stoppages:', err);
      onToast?.(t('errorLoadingStoppages'), 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedRoute, schoolId, onToast, t]);

  // Load fee structures
  const loadFeeStructures = useCallback(async () => {
    if (!selectedBus?.id || !academicYearId) {
      setFeeStructures({});
      return;
    }
    try {
      const response = await BusService.getFeeRateStructuresByBus(
        selectedBus.id, schoolId, academicYearId
      );
      
      let data = response?.data || response || [];
      if (!Array.isArray(data)) {
        data = [];
      }
      
      const feeMap = {};
      data.forEach(fee => {
        const stoppageId = fee.stoppageId || fee.stoppage?.id;
        if (stoppageId) {
          if (!feeMap[stoppageId] || fee.id > feeMap[stoppageId].id) {
            feeMap[stoppageId] = fee;
          }
        }
      });
      
      setFeeStructures(feeMap);
    } catch (err) {
      console.error('❌ Error loading fee structures:', err);
      setFeeStructures({});
    }
  }, [selectedBus, schoolId, academicYearId]);

  useEffect(() => {
    if (selectedBus?.id && schoolId) {
      loadRoutes();
      loadFeeStructures();
    }
  }, [selectedBus, schoolId, loadRoutes, loadFeeStructures]);

  useEffect(() => {
    if (selectedRoute?.id && schoolId) loadStoppages();
  }, [selectedRoute, schoolId, loadStoppages]);

  // Handle stoppage submit
  const handleSubmit = async () => {
    if (!form.stopName.trim()) {
      onToast?.(t('stopNameRequired'), 'error');
      return;
    }
    setLoading(true);
    try {
      if (editingStoppage) {
        await BusService.updateStoppage(schoolId, editingStoppage.id, form.stopName.trim());
        onToast?.(t('stoppageUpdatedSuccess'), 'success');
      } else {
        await BusService.addStoppage(schoolId, selectedRoute.id, form.stopName.trim());
        onToast?.(t('stoppageAddedSuccess'), 'success');
      }
      setModal(false);
      setForm({ stopName: '' });
      setEditingStoppage(null);
      await loadStoppages();
      await loadFeeStructures();
    } catch (err) {
      console.error('❌ Error saving stoppage:', err);
      onToast?.(t('errorSavingStoppage'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete stoppage with confirmation
  const handleDelete = (stoppageId, stopName) => {
    setConfirmDialog({
      open: true,
      title: t('deleteStoppage'),
      message: t('deleteStoppageConfirm', { stopName }),
      loading: false,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        try {
          await BusService.deleteStoppage(schoolId, stoppageId);
          onToast?.(t('stoppageDeletedSuccess'), 'success');
          await loadStoppages();
          await loadFeeStructures();
          setConfirmDialog(prev => ({ ...prev, open: false, loading: false }));
        } catch (err) {
          console.error('❌ Error deleting stoppage:', err);
          onToast?.(t('errorDeletingStoppage'), 'error');
          setConfirmDialog(prev => ({ ...prev, loading: false, open: false }));
        }
      }
    });
  };

  // Handle edit
  const handleEdit = (stoppage) => {
    setEditingStoppage(stoppage);
    setForm({ stopName: stoppage.stopName });
    setModal(true);
  };

  // Handle create fee structure with confirmation
  const handleCreateFeeStructure = async () => {
    if (!selectedStoppageForFee) {
      onToast?.(t('pleaseSelectStoppage'), 'error');
      return;
    }

    if (!academicYearId) {
      onToast?.(t('academicYearRequired'), 'error');
      return;
    }

    const amount = Number(feeStructureForm.monthlyFeeAmount);
    const totalMonths = Number(feeStructureForm.totalMonths);

    if (!amount || amount <= 0) {
      onToast?.(t('enterValidAmount'), 'error');
      return;
    }

    if (!totalMonths || totalMonths <= 0) {
      onToast?.(t('pleaseEnterValidTotalMonths'), 'error');
      return;
    }

    const stoppage = stoppages.find(s => s.id === Number(selectedStoppageForFee));

    setConfirmDialog({
      open: true,
      title: t('createFeeStructure'),
      message: t('createFeeStructureConfirm', {
        bus: selectedBus?.registrationNo || '-',
        stoppage: stoppage?.stopName || '-',
        amount: amount,
        totalMonths: totalMonths
      }),
      loading: false,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        try {
          await BusService.createFeeRateStructure({
            stoppageId: Number(selectedStoppageForFee),
            busId: Number(selectedBus.id),
            schoolId: Number(schoolId),
            academicYearId: Number(academicYearId),
            monthlyFeeAmount: amount,
            totalMonths,
            academicYearStartMonth: 'July',
          });

          onToast?.(t('feeStructureCreatedSuccess'), 'success');

          setFeeStructureForm({
            monthlyFeeAmount: '',
            totalMonths: 12,
          });
          setSelectedStoppageForFee(null);
          setFeeModal(false);

          await loadFeeStructures();
          setConfirmDialog(prev => ({ ...prev, open: false, loading: false }));
        } catch (error) {
          console.error('Error creating fee structure:', error);
          onToast?.(
            error?.response?.data?.message ||
              error?.response?.data?.error ||
              t('errorCreatingFeeStructure'),
            'error'
          );
          setConfirmDialog(prev => ({ ...prev, loading: false, open: false }));
        }
      }
    });
  };

  // Handle delete fee structure with confirmation
  const handleDeleteFeeStructure = (rateStructureId) => {
    setConfirmDialog({
      open: true,
      title: t('deleteFeeStructure'),
      message: t('deleteFeeStructureConfirm'),
      loading: false,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        try {
          await BusService.deleteFeeRateStructure(rateStructureId);
          onToast?.(t('feeStructureDeletedSuccess'), 'success');
          await loadFeeStructures();
          setConfirmDialog(prev => ({ ...prev, open: false, loading: false }));
        } catch (error) {
          console.error('Error deleting fee structure:', error);
          onToast?.(t('errorDeletingFeeStructure'), 'error');
          setConfirmDialog(prev => ({ ...prev, loading: false, open: false }));
        }
      }
    });
  };

  // Open fee modal for a stoppage
  const openFeeModal = (stoppage) => {
    setSelectedStoppageForFee(stoppage.id);
    const existingFee = feeStructures[stoppage.id];
    if (existingFee) {
      setFeeStructureForm({
        monthlyFeeAmount: String(existingFee.monthlyFeeAmount || ''),
        totalMonths: existingFee.totalMonths || 12,
      });
    } else {
      setFeeStructureForm({
        monthlyFeeAmount: '',
        totalMonths: 12,
      });
    }
    setFeeModal(true);
  };

  if (!selectedBus) {
    return (
      <div className="pri-card" style={{ padding: 40, textAlign: 'center' }}>
        <div className="pri-empty">
          <div className="pri-empty-icon">📍</div>
          <p>{t('pleaseSelectBus')}</p>
        </div>
      </div>
    );
  }

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
          <h3 style={{ margin: 0, color: '#1e3a5f' }}>
            📍 {t('stoppageManagement')} - {selectedBus.registrationNo}
          </h3>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select
            value={selectedRoute?.id || ''}
            onChange={(e) => {
              const route = routes.find((r) => r.id === parseInt(e.target.value));
              setSelectedRoute(route);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              background: 'white',
            }}
            disabled={loading}
          >
            <option value="">{t('selectRoute')}</option>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.routeName}
              </option>
            ))}
          </select>
          <button
            className="pri-btn pri-btn-primary pri-btn-sm"
            onClick={() => {
              setModal(true);
              setForm({ stopName: '' });
              setEditingStoppage(null);
            }}
            disabled={!selectedRoute || loading}
          >
            + {t('addStoppage')}
          </button>
        </div>
      </div>

      {selectedRoute && (
        <>
          <div
            style={{
              display: 'flex',
              gap: 20,
              marginBottom: 16,
              padding: '12px 16px',
              background: '#f0fdf4',
              borderRadius: 8,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <span style={{ fontSize: 12, color: '#64748b' }}>{t('route')}</span>
              <div style={{ fontWeight: 600 }}>{selectedRoute.routeName}</div>
            </div>
            <div>
              <span style={{ fontSize: 12, color: '#64748b' }}>{t('totalStoppages')}</span>
              <div style={{ fontWeight: 600 }}>{stoppages.length}</div>
            </div>
            <div>
              <span style={{ fontSize: 12, color: '#64748b' }}>{t('feeRatesSet')}</span>
              <div style={{ fontWeight: 600, color: '#16a34a' }}>
                {Object.keys(feeStructures).length} / {stoppages.length}
              </div>
            </div>
          </div>

          <div className="table-wrap">
            {loading && stoppages.length === 0 ? (
              <TableSkeleton rows={5} columns={4} />
            ) : (
              <table className="pri-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t('stopName')}</th>
                    <th>{t('feeRate')}</th>
                    <th>{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {stoppages.length === 0 ? (
                    <tr>
                      <td colSpan="4">
                        <div className="pri-empty">
                          <div className="pri-empty-icon">📍</div>
                          <p>{t('noStoppagesFound')}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    stoppages.map((stop, index) => {
                      const fee = feeStructures[stop.id];
                      return (
                        <tr key={stop.id}>
                          <td>{index + 1}</td>
                          <td>
                            <strong>{stop.stopName}</strong>
                          </td>
                          <td>
                            {fee ? (
                              <span style={{ color: '#16a34a', fontWeight: 600 }}>
                                ₹{fee.monthlyFeeAmount}/{t('month')}
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>{t('notSet')}</span>
                            )}
                          </td>
                          <td>
                            <div className="d-flex gap-8" style={{ flexWrap: 'wrap' }}>
                              <button
                                className="pri-btn pri-btn-sm"
                                onClick={() => openFeeModal(stop)}
                                disabled={loading}
                                style={{
                                  background: fee ? '#f59e0b' : '#16a34a',
                                  color: 'white',
                                  border: 'none',
                                  padding: '4px 10px',
                                  borderRadius: 4,
                                  cursor: 'pointer',
                                  fontSize: 12,
                                }}
                              >
                                {fee ? '✏️' : '💰'} {fee ? t('editFee') : t('setFee')}
                              </button>
                              <EditAndViewButton
                                icon="✏️"
                                toolTipTitle={t('editStoppage')}
                                onClick={() => handleEdit(stop)}
                              />
                              <DeleteButton
                                objectId={stop.id}
                                objectName={stop.stopName}
                                onDelete={() => handleDelete(stop.id, stop.stopName)}
                                itemType={t('stoppage')}
                                title={t('delete')}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Add/Edit Stoppage Modal */}
      {modal && (
        <PriModal
          title={editingStoppage ? `✏️ ${t('editStoppage')}` : `➕ ${t('addStoppage')}`}
          onClose={() => {
            setModal(false);
            setForm({ stopName: '' });
            setEditingStoppage(null);
          }}
          footer={
            <>
              <button
                className="pri-btn pri-btn-ghost"
                onClick={() => {
                  setModal(false);
                  setForm({ stopName: '' });
                  setEditingStoppage(null);
                }}
                disabled={loading}
              >
                {t('cancel')}
              </button>
              <button className="pri-btn pri-btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? t('saving') : editingStoppage ? t('updateStoppage') : t('addStoppage')}
              </button>
            </>
          }
        >
          <div className="pri-form-field mb-10">
            <label>{t('stopName')} *</label>
            <input
              type="text"
              value={form.stopName}
              onChange={(e) => setForm((prev) => ({ ...prev, stopName: e.target.value }))}
              placeholder={t('stopNamePlaceholder')}
              autoFocus
              disabled={loading}
            />
          </div>
        </PriModal>
      )}

      {/* Fee Structure Modal */}
      {feeModal && (
        <PriModal
          title={`${feeStructures[selectedStoppageForFee] ? '✏️' : '💰'} ${t('feeStructure')}`}
          onClose={() => {
            setFeeModal(false);
            setSelectedStoppageForFee(null);
            setFeeStructureForm({ monthlyFeeAmount: '', totalMonths: 12 });
          }}
          footer={
            <>
              <button
                className="pri-btn pri-btn-ghost"
                onClick={() => {
                  setFeeModal(false);
                  setSelectedStoppageForFee(null);
                  setFeeStructureForm({ monthlyFeeAmount: '', totalMonths: 12 });
                }}
                disabled={feeLoading}
              >
                {t('cancel')}
              </button>
              <button
                className="pri-btn pri-btn-primary"
                onClick={handleCreateFeeStructure}
                disabled={feeLoading}
              >
                {feeLoading ? '⏳' : '💾'} {feeStructures[selectedStoppageForFee] ? t('update') : t('create')}
              </button>
            </>
          }
        >
          <div style={{ padding: '4px 0' }}>
            <div
              style={{
                padding: '12px 14px',
                background: '#eff6ff',
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              🚌 {t('bus')}: <strong>{selectedBus?.registrationNo || '-'}</strong>
              <br />
              📍 {t('stoppage')}: <strong>
                {stoppages.find(s => s.id === Number(selectedStoppageForFee))?.stopName || '-'}
              </strong>
              <br />
              📅 {t('academicYear')}: <strong>{academicYearId || t('notSet')}</strong>
            </div>

            <div className="pri-form-field mb-10">
              <label>{t('monthlyFee')} (₹) *</label>
              <input
                type="number"
                min="1"
                value={feeStructureForm.monthlyFeeAmount}
                onChange={(e) =>
                  setFeeStructureForm((prev) => ({
                    ...prev,
                    monthlyFeeAmount: e.target.value,
                  }))
                }
                placeholder={t('enterMonthlyFee')}
                disabled={feeLoading}
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  width: '100%',
                  fontSize: 14,
                }}
              />
            </div>

            <div className="pri-form-field mb-10">
              <label>{t('totalMonths')} *</label>
              <input
                type="number"
                min="1"
                max="12"
                value={feeStructureForm.totalMonths}
                onChange={(e) =>
                  setFeeStructureForm((prev) => ({
                    ...prev,
                    totalMonths: e.target.value,
                  }))
                }
                disabled={feeLoading}
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  width: '100%',
                  fontSize: 14,
                }}
              />
            </div>

            {feeStructures[selectedStoppageForFee] && (
              <div
                style={{
                  padding: '10px 14px',
                  background: '#fef3c7',
                  borderRadius: 8,
                  fontSize: 13,
                  color: '#92400e',
                  marginTop: 8,
                }}
              >
                ⚠️ {t('editingExistingFee')}
                <br />
                <span style={{ fontSize: 12 }}>
                  {t('currentFee')}: ₹{feeStructures[selectedStoppageForFee]?.monthlyFeeAmount}/{t('month')}
                </span>
              </div>
            )}
          </div>
        </PriModal>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialog.open}
        handleClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        handleConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        loader={confirmDialog.loading}
        confirmLabel={t('yes')}
        cancelLabel={t('no')}
      />
    </div>
  );
}