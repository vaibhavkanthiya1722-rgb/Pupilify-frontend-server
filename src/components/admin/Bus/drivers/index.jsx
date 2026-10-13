// src/components/admin/Bus/drivers/index.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import BusService from '../../../../services/BusService';
import PriModal from '../../../admin/PriModal';
import DeleteButton from '../../../common/DeleteButton';
import TableSkeleton from '../../../loaders/TableSkeleton';

export default function DriverManager({ schoolId, buses, onToast }) {
  const { t } = useTranslation();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phoneNo: '',
    dob: '',
    address: '',
    busId: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const loadDrivers = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
      const response = await BusService.getDriversBySchool(schoolId);
      const data = response?.data || response || [];
      setDrivers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Error loading drivers:', err);
      onToast?.(t('errorLoadingDrivers'), 'error');
    } finally {
      setLoading(false);
    }
  }, [schoolId, onToast, t]);

  useEffect(() => {
    loadDrivers();
  }, [loadDrivers]);

  const validateEmail = (email) => {
    if (!email) return t('emailRequired');
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|org|gov|edu|io|co|[a-z]{2})$/i;
    if (!emailRegex.test(email)) return t('validEmailRequired');
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return t('passwordIsRequired');
    if (password.length < 6) return t('passwordMinLength', { minLength: 6 });
    return '';
  };

  const validateName = (name) => {
    if (!name) return t('usernameRequired');
    if (name.trim().length < 2) return t('nameMinLength', { minLength: 2 });
    return '';
  };

  const validateField = (field, value) => {
    let error = '';
    switch (field) {
      case 'name':
        error = validateName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
    return error === '';
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) validateField(name, value);
  };

  const handleSubmit = async () => {
    const nameError = validateName(form.name);
    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);

    setTouched({ name: true, email: true, password: true });
    setErrors({ name: nameError, email: emailError, password: passwordError });

    if (nameError || emailError || passwordError) {
      onToast?.(t('pleaseFixErrors'), 'error');
      return;
    }

    setLoading(true);
    try {
      await BusService.createDriver(
        schoolId,
        {
          name: form.name,
          email: form.email,
          password: form.password,
          phoneNo: form.phoneNo || null,
          dob: form.dob || null,
          address: form.address || null,
        },
        form.busId || null
      );
      onToast?.(t('driverCreatedSuccess'), 'success');
      setModal(false);
      setForm({
        name: '',
        email: '',
        password: '',
        phoneNo: '',
        dob: '',
        address: '',
        busId: '',
      });
      await loadDrivers();
    } catch (err) {
      console.error('❌ Error creating driver:', err);
      const errorMsg =
        err.response?.data?.message || err.response?.data?.error || t('errorCreatingDriver');
      onToast?.(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(t('deleteDriverConfirm', { name }))) return;
    setLoading(true);
    try {
      await BusService.deleteDriver(schoolId, id);
      onToast?.(t('driverDeletedSuccess'), 'success');
      await loadDrivers();
    } catch (err) {
      console.error('❌ Error deleting driver:', err);
      onToast?.(t('errorDeletingDriver'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignBus = async (driverId, busId) => {
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) {
      onToast?.(t('driverNotFound'), 'error');
      return;
    }

    // Remove from bus
    if (!busId || busId === '') {
      if (!driver.bus) {
        onToast?.(t('driverAlreadyHasNoBus', { driverName: driver.name }), 'info');
        return;
      }
      if (!window.confirm(t('removeDriverConfirm', { driverName: driver.name }))) return;
      setLoading(true);
      try {
        await BusService.removeDriverFromBus(schoolId, driverId);
        onToast?.(t('driverRemovedSuccess', { driverName: driver.name }), 'success');
        await loadDrivers();
      } catch (err) {
        console.error('❌ Error removing driver:', err);
        onToast?.(t('errorRemovingDriver'), 'error');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Already on same bus
    if (driver.bus?.id === parseInt(busId)) {
      onToast?.(t('driverAlreadyOnThisBus'), 'info');
      return;
    }

    // Already on another bus
    if (driver.bus && busId) {
      if (
        !window.confirm(
          t('driverAlreadyAssignedWarn', {
            driverName: driver.name,
            currentBus: driver.bus.registrationNo,
          })
        )
      )
        return;
    }

    if (!window.confirm(t('assignDriverConfirm', { driverName: driver.name }))) return;

    setLoading(true);
    try {
      await BusService.assignDriverToBus(schoolId, driverId, busId);
      const bus = buses.find((b) => b.id === parseInt(busId));
      onToast?.(
        t('driverAssignedSuccess', {
          driverName: driver.name,
          bus: bus?.registrationNo || '',
        }),
        'success'
      );
      await loadDrivers();
    } catch (err) {
      console.error('❌ Error assigning driver:', err);
      let errorMsg = t('errorAssigningDriver');
      if (err.response?.status === 409) {
        errorMsg = err.response?.data?.message || t('driverOrBusAlreadyAssigned');
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      onToast?.(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

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
          padding: '8px 16px',
        }}
      >
        <div>
          <h3 style={{ margin: 0, color: '#1e3a5f' }}>👨‍✈️ {t('driverManagement')}</h3>
          <span style={{ fontSize: 13, color: '#64748b' }}>
            {drivers.length} {t('drivers')}
          </span>
        </div>
        <button
          className="pri-btn pri-btn-primary pri-btn-sm"
          onClick={() => setModal(true)}
          disabled={loading}
        >
          + {t('addDriver')}
        </button>
      </div>

      <div className="table-wrap">
        {loading && drivers.length === 0 ? (
          <TableSkeleton rows={5} columns={6} />
        ) : (
          <table className="pri-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t('name')}</th>
                <th>{t('email')}</th>
                <th>{t('phone')}</th>
                <th>{t('assignedBus')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {drivers.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="pri-empty">
                      <div className="pri-empty-icon">👨‍✈️</div>
                      <p>{t('noDriversFound')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                drivers.map((driver, index) => (
                  <tr key={driver.id}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{driver.name}</strong>
                    </td>
                    <td>{driver.email}</td>
                    <td>{driver.phoneNo || '-'}</td>
                    <td>
                      {driver.bus ? (
                        <span className="pri-badge pri-badge-blue">
                          🚌 {driver.bus.registrationNo}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: 12 }}>
                          {t('notAssigned')}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-8" style={{ flexWrap: 'wrap' }}>
                        <select
                          value={driver.bus?.id || ''}
                          onChange={(e) => handleAssignBus(driver.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 4,
                            border: '1px solid #e2e8f0',
                            fontSize: 12,
                            background: 'white',
                            minWidth: 120,
                          }}
                          disabled={loading}
                        >
                         
                          {buses.map((bus) => (
                            <option key={bus.id} value={bus.id}>
                              🚌 {bus.registrationNo}
                            </option>
                          ))}
                        </select>
                        <DeleteButton
                          objectId={driver.id}
                          objectName={driver.name}
                          onDelete={handleDelete}
                          itemType={t('driver')}
                          title={t('deleteDriver')}
                          icon="🗑️"
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

      {/* Add Driver Modal */}
      {modal && (
        <PriModal
          title={`➕ ${t('addDriver')}`}
          onClose={() => {
            setModal(false);
            setForm({
              name: '',
              email: '',
              password: '',
              phoneNo: '',
              dob: '',
              address: '',
              busId: '',
            });
            setErrors({});
            setTouched({});
          }}
          footer={
            <>
              <button
                className="pri-btn pri-btn-ghost"
                onClick={() => {
                  setModal(false);
                  setForm({
                    name: '',
                    email: '',
                    password: '',
                    phoneNo: '',
                    dob: '',
                    address: '',
                    busId: '',
                  });
                }}
                disabled={loading}
              >
                {t('cancel')}
              </button>
              <button className="pri-btn pri-btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? t('saving') : t('createDriver')}
              </button>
            </>
          }
        >
          <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 6, marginBottom: 12, fontWeight: 600, fontSize: 14, color: '#1e3a5f' }}>
            👤 {t('personalInformation')}
          </div>

          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('fullName')} *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={t('driverNamePlaceholder')}
                autoFocus
                disabled={loading}
                className={errors.name && touched.name ? 'error-input' : ''}
              />
              {errors.name && touched.name && <span className="pri-error-message">{errors.name}</span>}
            </div>
            <div className="pri-form-field">
              <label>{t('email')} *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={t('emailPlaceholder')}
                disabled={loading}
                className={errors.email && touched.email ? 'error-input' : ''}
              />
              {errors.email && touched.email && (
                <span className="pri-error-message">{errors.email}</span>
              )}
            </div>
          </div>

          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('password')} *</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={t('passwordPlaceholder')}
                disabled={loading}
                className={errors.password && touched.password ? 'error-input' : ''}
              />
              {errors.password && touched.password && (
                <span className="pri-error-message">{errors.password}</span>
              )}
              <div className="pri-note" style={{ fontSize: '12px', marginTop: '5px', color: '#64748b' }}>
                {t('passwordMinLength', { minLength: 6 })}
              </div>
            </div>
            <div className="pri-form-field">
              <label>{t('phone')}</label>
              <input
                type="text"
                name="phoneNo"
                value={form.phoneNo}
                onChange={handleChange}
                placeholder={t('phonePlaceholder')}
                disabled={loading}
              />
            </div>
          </div>

          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('dateOfBirth')}</label>
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="pri-form-field">
              <label>{t('address')}</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder={t('addressPlaceholder')}
                disabled={loading}
              />
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 6, marginBottom: 12, marginTop: 8, fontWeight: 600, fontSize: 14, color: '#1e3a5f' }}>
            🚌 {t('busAssignment')}
          </div>

          <div className="pri-form-field">
            <label>{t('assignToBus')}</label>
            <select
              name="busId"
              value={form.busId}
              onChange={handleChange}
              disabled={loading}
              style={{ width: '100%' }}
            >
              <option value="">-- {t('selectBus')} --</option>
              {buses.map((bus) => (
                <option key={bus.id} value={bus.id}>
                  {bus.registrationNo} (Capacity: {bus.capacity})
                </option>
              ))}
            </select>
            <small style={{ color: '#64748b' }}>💡 {t('driverCanBeAssignedLater')}</small>
          </div>
        </PriModal>
      )}
    </div>
  );
}