import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const PrescriptionView = ({ isOpen, onClose, appointmentId }) => {
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && appointmentId) {
      setLoading(true);
      setError('');
      fetch(`${API_BASE_URL}/prescriptions/appointment/${appointmentId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setPrescription(data.data);
          } else {
            setError(data.message || 'No prescription found');
          }
        })
        .catch(() => setError('Failed to fetch prescription'))
        .finally(() => setLoading(false));
    }
  }, [isOpen, appointmentId]);

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
          <div className="flex items-center justify-between p-6 border-b border-secondary-100">
            <h2 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
              <FileText size={24} className="text-primary-600" /> Prescription
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-secondary-600" />
            </button>
          </div>
          {/* Content */}
          <div className="p-8">
            {loading ? (
              <div className="text-center py-8 text-secondary-500 text-lg">Loading...</div>
            ) : error ? (
              <div className="flex flex-col items-center gap-2 p-6 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle size={32} className="text-red-500" />
                <span className="text-base text-red-700">{error}</span>
              </div>
            ) : prescription ? (
              <div className="bg-secondary-50 border border-secondary-200 rounded-xl shadow p-6">
                <div className="mb-4 text-secondary-600 text-sm flex flex-col md:flex-row md:items-center md:gap-4">
                  <span><strong>Therapist:</strong> {prescription.therapist?.name}</span>
                  <span className="hidden md:inline">|</span>
                  <span><strong>Date:</strong> {new Date(prescription.createdAt).toLocaleString()}</span>
                </div>
                <div className="whitespace-pre-line text-secondary-900 text-lg font-medium">
                  {prescription.notes}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 p-8">
                <FileText size={40} className="text-secondary-300" />
                <div className="text-center text-secondary-500 text-lg font-medium">No prescription found for this session.</div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PrescriptionView; 