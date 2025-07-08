import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { useBooking } from '../contexts/BookingContext';

const PrescriptionModal = ({ isOpen, onClose, appointment, onSuccess }) => {
  const [notes, setNotes] = useState(appointment?.prescription || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { updateAppointmentPrescription } = useBooking();

  useEffect(() => {
    setNotes(appointment?.prescription || '');
  }, [appointment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!appointment?._id) {
      setError('Missing appointment ID.');
      setLoading(false);
      return;
    }
    try {
      const result = await updateAppointmentPrescription(appointment._id, notes);
      if (result.success) {
        if (onSuccess) onSuccess(result.data);
        onClose();
      } else {
        setError(result.error || 'Failed to save prescription');
      }
    } catch (err) {
      setError('Failed to save prescription');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto border border-secondary-100"
        >
          {/* Header */}
          <div className="flex flex-col gap-1 items-start justify-between p-6 border-b border-secondary-100">
            <div className="flex items-center gap-3 w-full">
              <FileText size={24} className="text-primary-600" />
              <h2 className="text-2xl font-bold text-secondary-900">Edit Prescription</h2>
            </div>
          </div>
          {/* Content */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block text-base font-semibold text-secondary-700 mb-2">Prescription</label>
              <textarea
                className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-500 min-h-[140px] bg-secondary-50 text-lg resize-vertical shadow-sm transition-all"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                required
                placeholder="Enter prescription for this patient/session..."
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle size={16} className="text-red-600" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}
            <div className="flex gap-4 pt-4 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-secondary-700 bg-secondary-100 hover:bg-secondary-200 rounded-xl font-medium transition-colors shadow-sm"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-xl font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PrescriptionModal; 