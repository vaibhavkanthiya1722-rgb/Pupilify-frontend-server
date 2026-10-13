// src/components/admin/Bus/BusController.js
import { useState, useEffect, useCallback } from 'react';
import BusService from '../../../services/BusService';

export default function BusController({ schoolId, onToast, t }) {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [form, setForm] = useState({ busNumber: '', capacity: '' });

  const openModal = () => {
    setForm({ busNumber: '', capacity: '' });
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setForm({ busNumber: '', capacity: '' });
  };

  const loadBuses = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
      const response = await BusService.getBuses(schoolId);
      const data = response?.data || response || [];
      setBuses(Array.isArray(data) ? data : []);

      if (data.length > 0) {
        setSelectedBus((prev) => {
          if (prev && data.some((bus) => bus.id === prev.id)) {
            return prev;
          }
          return data[0];
        });
      } else {
        setSelectedBus(null);
      }
    } catch (err) {
      console.error('❌ Error loading buses:', err);
      onToast?.(t('errorLoadingBuses'), 'error');
    } finally {
      setLoading(false);
    }
  }, [schoolId, onToast, t]);

  useEffect(() => {
    loadBuses();
  }, [loadBuses]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.busNumber?.trim()) {
      onToast?.(t('busNumberRequired'), 'error');
      return;
    }
    if (!form.capacity || Number(form.capacity) <= 0) {
      onToast?.(t('capacityRequired'), 'error');
      return;
    }

    setLoading(true);
    try {
      await BusService.addBus(
        schoolId,
        form.busNumber.trim(),
        Number(form.capacity)
      );
      onToast?.(t('busCreatedSuccess'), 'success');
      closeModal();
      await loadBuses();
    } catch (err) {
      console.error('❌ Error saving bus:', err);
      const errorMsg =
        err.response?.data?.message || err.response?.data?.error || t('errorSavingBus');
      onToast?.(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, busNumber, bus) => {
    if (!window.confirm(t('deleteBusConfirm', { busNumber }))) return;
    setLoading(true);
    try {
      await BusService.deleteBus(schoolId, id);
      onToast?.(t('busDeletedSuccess'), 'success');
      if (selectedBus?.id === id) setSelectedBus(null);
      await loadBuses();
    } catch (err) {
      console.error('❌ Error deleting bus:', err);
      onToast?.(t('errorDeletingBus'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
}