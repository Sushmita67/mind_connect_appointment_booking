import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, User, Phone, Mail, Heart, Clock3, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';
import { useNavigate } from 'react-router-dom';
import RescheduleModal from '../components/RescheduleModal';
import TherapistDashboard from './TherapistDashboard';
import PrescriptionView from '../components/PrescriptionView';

const MyAppointments = () => {
  const { user } = useAuth();
  const { appointments, fetchUserAppointments, fetchTherapistAppointments, cancelAppointment, getUpcomingAppointments, getPastAppointments, setCurrentStep, updateBookingData, addToCart } = useBooking();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [rescheduleModal, setRescheduleModal] = useState({ isOpen: false, appointment: null });
  const [prescriptionViewOpen, setPrescriptionViewOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'therapist') {
        fetchTherapistAppointments().finally(() => setLoading(false));
      } else {
        fetchUserAppointments().finally(() => setLoading(false));
      }
    }
  }, [user, fetchUserAppointments, fetchTherapistAppointments]);

  const upcomingAppointments = getUpcomingAppointments();
  const pastAppointments = getPastAppointments();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'pending':
        return <Clock3 size={16} className="text-yellow-600" />;
      case 'completed':
        return <CheckCircle size={16} className="text-blue-600" />;
      case 'cancelled':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <AlertCircle size={16} className="text-gray-600" />;
    }
  };

  const handleBooking = () => {
    navigate('/booking');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await cancelAppointment(appointmentId);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  const handleReschedule = (appointment) => {
    setRescheduleModal({ isOpen: true, appointment });
  };

  const closeRescheduleModal = () => {
    setRescheduleModal({ isOpen: false, appointment: null });
  };

  const appointmentsToShow = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Show therapist dashboard if user is a therapist
  if (user?.role === 'therapist') {
    return <TherapistDashboard />;
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">My Appointments</h1>
          <p className="text-secondary-600">
            Welcome back, {user?.name || 'User'}! Here are your {user?.role === 'therapist' ? 'client sessions' : 'therapy sessions'}.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Total Sessions</p>
                <p className="text-2xl font-bold text-secondary-900">{appointments.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Heart size={24} className="text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Upcoming</p>
                <p className="text-2xl font-bold text-secondary-900">{upcomingAppointments.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Completed</p>
                <p className="text-2xl font-bold text-secondary-900">{pastAppointments.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Total Spent</p>
                <p className="text-2xl font-bold text-secondary-900">
                  Rs.{appointments.reduce((total, apt) => total + (apt.price || 0), 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock size={24} className="text-purple-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-secondary-200 mb-6"
        >
          <div className="flex border-b border-secondary-200">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'upcoming'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
              }`}
            >
              Upcoming ({upcomingAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'past'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
              }`}
            >
              Past ({pastAppointments.length})
            </button>
          </div>
        </motion.div>

        {/* Appointments List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {appointmentsToShow.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-secondary-200">
              <Heart size={48} className="text-secondary-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">
                No {activeTab} appointments
              </h3>
              <p className="text-secondary-600 mb-6">
                {activeTab === 'upcoming' 
                  ? "You don't have any upcoming appointments. Book your next session!"
                  : "You haven't completed any sessions yet."
                }
              </p>
              {activeTab === 'upcoming' && (
                <button className="btn-primary" onClick={handleBooking}>
                  Book Appointment
                </button>
              )}
            </div>
          ) : (
            appointmentsToShow.map((appointment, index) => (
              <motion.div
                key={appointment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-secondary-900">
                          {appointment.session?.name || 'Session'}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-secondary-600 mb-3">
                        {user?.role === 'therapist' 
                          ? `Client: ${appointment.client?.name || appointment.guestInfo?.name || 'Guest'}`
                          : `with ${appointment.therapist?.name || 'Therapist'}`
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-secondary-900">
                        Rs.{appointment.price || 0}
                      </p>
                      <p className="text-sm text-secondary-500">
                        {appointment.duration ? `${appointment.duration} min` : '60 min'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <Calendar size={16} className="text-secondary-400" />
                      <span className="text-sm text-secondary-700">
                        {formatDate(appointment.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock size={16} className="text-secondary-400" />
                      <span className="text-sm text-secondary-700">
                        {appointment.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-secondary-400" />
                      <span className="text-sm text-secondary-700">
                        {appointment.location || 'Virtual Session'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <User size={16} className="text-secondary-400" />
                      <span className="text-sm text-secondary-700">
                        {user?.role === 'therapist' 
                          ? appointment.client?.name || appointment.guestInfo?.name || 'Client'
                          : appointment.therapist?.name || 'Therapist'
                        }
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-secondary-200 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {user?.role === 'therapist' ? (
                          <>
                            {appointment.client?.phone && (
                              <div className="flex items-center gap-2">
                                <Phone size={14} className="text-secondary-400" />
                                <span className="text-xs text-secondary-600">
                                  {appointment.client.phone}
                                </span>
                              </div>
                            )}
                            {appointment.client?.email && (
                              <div className="flex items-center gap-2">
                                <Mail size={14} className="text-secondary-400" />
                                <span className="text-xs text-secondary-600">
                                  {appointment.client.email}
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            {appointment.therapist?.phone && (
                              <div className="flex items-center gap-2">
                                <Phone size={14} className="text-secondary-400" />
                                <span className="text-xs text-secondary-600">
                                  {appointment.therapist.phone}
                                </span>
                              </div>
                            )}
                            {appointment.therapist?.email && (
                              <div className="flex items-center gap-2">
                                <Mail size={14} className="text-secondary-400" />
                                <span className="text-xs text-secondary-600">
                                  {appointment.therapist.email}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {activeTab === 'upcoming' && appointment.status === 'confirmed' && (
                          <button className="btn-secondary text-sm px-4 py-2" onClick={() => handleReschedule(appointment)}>
                            Reschedule
                          </button>
                        )}
                        {activeTab === 'upcoming' && appointment.status === 'pending' && (
                          <button 
                            className="btn-secondary text-sm px-4 py-2"
                            onClick={() => handleCancelAppointment(appointment._id)}
                          >
                            Cancel
                          </button>
                        )}
                        {activeTab === 'past' && (
                          <div className="flex gap-2 mt-2">
                            <button
                              className="px-3 py-1 bg-secondary-600 text-white rounded hover:bg-secondary-700 text-xs"
                              onClick={() => { setSelectedAppointment(appointment); setPrescriptionViewOpen(true); }}
                            >
                              View Prescription/Notes
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleModal.isOpen && rescheduleModal.appointment && (
        <RescheduleModal
          isOpen={rescheduleModal.isOpen}
          onClose={closeRescheduleModal}
          appointment={rescheduleModal.appointment}
        />
      )}

      {/* Prescription View Modal */}
      <PrescriptionView
        isOpen={prescriptionViewOpen}
        onClose={() => setPrescriptionViewOpen(false)}
        appointmentId={selectedAppointment?._id}
      />
    </div>
  );
};

export default MyAppointments; 