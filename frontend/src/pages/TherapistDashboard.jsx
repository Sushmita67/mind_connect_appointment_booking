import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, User, Phone, Mail, Heart, Clock3, CheckCircle, XCircle, AlertCircle, Users, DollarSign, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';
import PrescriptionModal from '../components/PrescriptionModal';
import PrescriptionView from '../components/PrescriptionView';

const TherapistDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { appointments, fetchTherapistAppointments, getUpcomingAppointments, getPastAppointments } = useBooking();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [prescriptionViewOpen, setPrescriptionViewOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescriptionExists, setPrescriptionExists] = useState({});
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  useEffect(() => {
    if (!authLoading && user) {
      setLoading(true);
      fetchTherapistAppointments().finally(() => setLoading(false));
    }
  }, [user, authLoading]);

  const upcomingAppointments = getUpcomingAppointments();
  const pastAppointments = getPastAppointments();

  // Debug logs
  console.log('user', user);
  console.log('appointments', appointments);
  console.log('upcomingAppointments', upcomingAppointments);

  // Upcoming appointments for this therapist only
  const myUpcomingAppointments = upcomingAppointments.filter(
    apt =>
      (typeof apt.therapist === 'object' ? apt.therapist?._id : apt.therapist) === user?._id
  );

  // Past appointments for this therapist only
  const myPastAppointments = pastAppointments.filter(
    apt =>
      (typeof apt.therapist === 'object' ? apt.therapist?._id : apt.therapist) === user?._id
  );

  // Calculate total earnings from past appointments only (filtered)
  const getTotalEarnings = () => {
    return myPastAppointments
      .filter(apt => apt.status === 'completed')
      .reduce((total, apt) => total + (apt.price || 0), 0);
  };

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

  const formatTime = (timeString) => {
    return timeString;
  };

  const getWeekDates = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDates.push(day);
    }
    return weekDates;
  };

  const getAppointmentsForDate = (date, appointmentsList) => {
    return appointmentsList.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  const getWeekAppointments = () => {
    const weekDates = getWeekDates(selectedWeek);
    const appointmentsToShow = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;
    
    return weekDates.map(date => ({
      date,
      appointments: getAppointmentsForDate(date, appointmentsToShow)
    }));
  };

  const getTotalClients = () => {
    const uniqueClients = new Set();
    appointments.forEach(apt => {
      if (apt.client?._id) {
        uniqueClients.add(apt.client._id);
      } else if (apt.guestInfo?.email) {
        uniqueClients.add(apt.guestInfo.email);
      }
    });
    return uniqueClients.size;
  };

  const getNextUpcomingAppointment = () => {
    const now = new Date();
    const upcoming = upcomingAppointments.filter(apt => 
      new Date(apt.date) > now && apt.status !== 'cancelled'
    );
    
    if (upcoming.length === 0) return null;
    
    // Sort by date and time, then return the first one
    return upcoming.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA - dateB;
    })[0];
  };

  const getUpcomingAppointmentsForWeek = () => {
    const weekDates = getWeekDates(selectedWeek);
    const weekStart = weekDates[0];
    const weekEnd = new Date(weekDates[6]);
    weekEnd.setDate(weekEnd.getDate() + 1); // End of the last day
    
    return upcomingAppointments
      .filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate >= weekStart && aptDate < weekEnd && apt.status !== 'cancelled';
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
      });
  };

  const isNextAppointment = (appointment) => {
    const nextAppointment = getNextUpcomingAppointment();
    if (!nextAppointment) return false;
    
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
    const nextDateTime = new Date(`${nextAppointment.date}T${nextAppointment.time}`);
    
    return appointmentDateTime.getTime() === nextDateTime.getTime();
  };

  const handleCreatePrescription = (appointment) => {
    // Implementation of handleCreatePrescription function
  };

  const handleOpenPrescriptionModal = async (appointment) => {
    setSelectedAppointment(appointment);
    try {
      const res = await fetch(`${API_BASE_URL}/prescriptions/appointment/${appointment._id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setSelectedPrescription(data.data);
        setPrescriptionExists(prev => ({ ...prev, [appointment._id]: true }));
      } else {
        setSelectedPrescription(null);
        setPrescriptionExists(prev => ({ ...prev, [appointment._id]: false }));
      }
    } catch {
      setSelectedPrescription(null);
      setPrescriptionExists(prev => ({ ...prev, [appointment._id]: false }));
    }
    setPrescriptionModalOpen(true);
  };

  // Remove the prescription existence fetch on mount
  // Instead, check prescription existence only when opening the modal
  // useEffect(() => {
  //   const fetchPrescriptions = async () => {
  //     const results = {};
  //     for (const apt of myPastAppointments) {
  //       try {
  //         const res = await fetch(`${API_BASE_URL}/prescriptions/appointment/${apt._id}`);
  //         const data = await res.json();
  //         results[apt._id] = data.success && data.data;
  //       } catch {
  //         results[apt._id] = false;
  //       }
  //     }
  //     setPrescriptionExists(results);
  //   };
  //   // Only depend on IDs to avoid infinite loop
  //   const ids = myPastAppointments.map(a => a._id).join(',');
  //   if (myPastAppointments.length > 0) fetchPrescriptions();
  //   // eslint-disable-next-line
  // }, [myPastAppointments.length, myPastAppointments.map(a => a._id).join(',')]);

  if (loading || !user || !appointments) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <div className="mt-4 text-secondary-600">Loading...</div>
      </div>
    );
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
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Therapist Dashboard</h1>
          <p className="text-secondary-600">
            Welcome back, {user?.name || 'Therapist'}! Here's your appointment overview.
          </p>
        </motion.div>

        {/* Stats Cards - moved above upcoming appointments */}
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
                <p className="text-2xl font-bold text-secondary-900">{myUpcomingAppointments.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Total Clients</p>
                <p className="text-2xl font-bold text-secondary-900">{getTotalClients()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Total Earnings</p>
                <p className="text-2xl font-bold text-secondary-900">
                  Rs.{getTotalEarnings()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign size={24} className="text-purple-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Upcoming Appointments - All Future (filtered for this therapist) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl shadow-sm p-6 border border-primary-200 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-primary-600" />
              <h3 className="text-lg font-bold text-primary-900">
                All Upcoming Appointments
              </h3>
            </div>
            <div className="text-base text-primary-700">
              {myUpcomingAppointments.length} appointment{myUpcomingAppointments.length !== 1 ? 's' : ''}
            </div>
          </div>
          {myUpcomingAppointments.length > 0 ? (
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {myUpcomingAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="p-4 rounded-xl border bg-white border-primary-200 shadow flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-primary-600" />
                        <span className="text-base font-semibold text-primary-900">
                          {formatDate(appointment.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-primary-600" />
                        <span className="text-base font-semibold text-primary-900">
                          {appointment.time}
                        </span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-semibold border ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-1">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-primary-600" />
                      <span className="text-base text-primary-800 font-medium">
                        {appointment.client?.name || appointment.guestInfo?.name || 'Client'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart size={16} className="text-primary-600" />
                      <span className="text-base text-primary-800 font-medium">
                        {appointment.session?.name || 'Session'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold text-primary-700">
                        Rs.{appointment.price || 0}
                      </span>
                    </div>
                  </div>
                  {(appointment.client?.phone || appointment.client?.email) && (
                    <div className="mt-2 pt-2 border-t border-primary-200">
                      <div className="flex items-center gap-4 text-base text-primary-600">
                        {appointment.client?.phone && (
                          <div className="flex items-center gap-1">
                            <Phone size={14} />
                            <span>{appointment.client.phone}</span>
                          </div>
                        )}
                        {appointment.client?.email && (
                          <div className="flex items-center gap-1">
                            <Mail size={14} />
                            <span>{appointment.client.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar size={32} className="text-primary-400 mx-auto mb-3" />
              <p className="text-primary-700 font-medium">No upcoming appointments</p>
              <p className="text-primary-600 text-sm mt-1">All clear for now!</p>
            </div>
          )}
        </motion.div>

        {/* Past Appointments - All Previous */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-secondary-200 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock3 size={20} className="text-secondary-600" />
              <h3 className="text-lg font-semibold text-secondary-900">
                Past Appointments
              </h3>
            </div>
            <div className="text-sm text-secondary-700">
              {myPastAppointments.length} appointment{myPastAppointments.length !== 1 ? 's' : ''}
            </div>
          </div>
          {myPastAppointments.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {myPastAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="p-3 rounded-lg border bg-white border-secondary-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-secondary-600" />
                        <span className="text-sm font-medium text-secondary-900">
                          {formatDate(appointment.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-secondary-600" />
                        <span className="text-sm font-medium text-secondary-900">
                          {appointment.time}
                        </span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-secondary-600" />
                      <span className="text-sm text-secondary-800">
                        {appointment.client?.name || appointment.guestInfo?.name || 'Client'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart size={14} className="text-secondary-600" />
                      <span className="text-sm text-secondary-800">
                        {appointment.session?.name || 'Session'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-secondary-700">
                        Rs.{appointment.price || 0}
                      </span>
                    </div>
                  </div>
                  {(appointment.client?.phone || appointment.client?.email) && (
                    <div className="mt-2 pt-2 border-t border-secondary-200">
                      <div className="flex items-center gap-4 text-xs text-secondary-600">
                        {appointment.client?.phone && (
                          <div className="flex items-center gap-1">
                            <Phone size={12} />
                            <span>{appointment.client.phone}</span>
                          </div>
                        )}
                        {appointment.client?.email && (
                          <div className="flex items-center gap-1">
                            <Mail size={12} />
                            <span>{appointment.client.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    {!prescriptionExists[appointment._id] && (
                      <button
                        className="px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 text-xs"
                        onClick={() => handleOpenPrescriptionModal(appointment)}
                      >
                        Write Prescription
                      </button>
                    )}
                    {prescriptionExists[appointment._id] && (
                      <button
                        className="px-3 py-1 bg-secondary-600 text-white rounded hover:bg-secondary-700 text-xs"
                        onClick={() => handleOpenPrescriptionModal(appointment)}
                      >
                        View/Edit Prescription
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock3 size={32} className="text-secondary-400 mx-auto mb-3" />
              <p className="text-secondary-700 font-medium">No past appointments</p>
              <p className="text-secondary-600 text-sm mt-1">No previous appointments found</p>
            </div>
          )}
        </motion.div>
      </div>
      {/* Prescription Modal */}
      <PrescriptionModal
        isOpen={prescriptionModalOpen}
        onClose={() => setPrescriptionModalOpen(false)}
        appointment={selectedAppointment}
        patient={selectedAppointment?.client}
        therapist={user}
        prescription={selectedPrescription}
        onSuccess={() => setPrescriptionExists(prev => ({ ...prev, [selectedAppointment._id]: true }))}
        onDelete={() => setPrescriptionExists(prev => ({ ...prev, [selectedAppointment._id]: false }))}
      />
      {/* Prescription View Modal */}
      <PrescriptionView
        isOpen={prescriptionViewOpen}
        onClose={() => setPrescriptionViewOpen(false)}
        appointmentId={selectedAppointment?._id}
      />
    </div>
  );
};

export default TherapistDashboard; 