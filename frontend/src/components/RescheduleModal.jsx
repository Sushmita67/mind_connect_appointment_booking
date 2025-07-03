import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useBooking } from '../contexts/BookingContext';

const RescheduleModal = ({ isOpen, onClose, appointment }) => {
  const { rescheduleAppointment, getAvailableDates, getAvailableTimes } = useBooking();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableDates = getAvailableDates().filter(date => date.getDay() !== 6); // Filter out Saturdays (day 6)
  const availableTimes = getAvailableTimes();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      setError('Please select both date and time');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await rescheduleAppointment(appointment._id, selectedDate, selectedTime);
      if (result.success) {
        onClose();
        // You can add a success toast here if needed
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
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
          className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary-200">
            <h2 className="text-xl font-semibold text-secondary-900">
              Reschedule Appointment
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-secondary-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Current Appointment Info */}
            <div className="bg-secondary-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-secondary-900 mb-2">Current Appointment</h3>
              <div className="space-y-1 text-sm text-secondary-600">
                <p><strong>Session:</strong> {appointment.session?.name}</p>
                <p><strong>Therapist:</strong> {appointment.therapist?.name}</p>
                <p><strong>Current Date:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
                <p><strong>Current Time:</strong> {appointment.time}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  Select New Date
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Choose a date</option>
                  {availableDates.map((date) => (
                    <option key={date.toISOString()} value={formatDateForInput(date)}>
                      {formatDate(date)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  <Clock size={16} className="inline mr-2" />
                  Select New Time
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Choose a time</option>
                  {availableTimes.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle size={16} className="text-red-600" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-secondary-700 bg-secondary-100 hover:bg-secondary-200 rounded-lg transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Rescheduling...' : 'Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RescheduleModal; 