import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, User, Phone, Mail, Heart, Clock3, CheckCircle, XCircle, AlertCircle, Users, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';

const TherapistDashboard = () => {
  const { user } = useAuth();
  const { appointments, fetchTherapistAppointments, getUpcomingAppointments, getPastAppointments } = useBooking();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  useEffect(() => {
    if (user) {
      fetchTherapistAppointments().finally(() => setLoading(false));
    }
  }, [user, fetchTherapistAppointments]);

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

  const getTotalEarnings = () => {
    return appointments
      .filter(apt => apt.status === 'completed')
      .reduce((total, apt) => total + (apt.price || 0), 0);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {/* Upcoming Appointments for Week - Full Width */}
          <div className="md:col-span-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl shadow-sm p-6 border border-primary-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-primary-600" />
                <h3 className="text-lg font-semibold text-primary-900">
                  Upcoming Appointments This Week
                </h3>
              </div>
              <div className="text-sm text-primary-700">
                {getUpcomingAppointmentsForWeek().length} appointment{getUpcomingAppointmentsForWeek().length !== 1 ? 's' : ''}
              </div>
            </div>
            
            {getUpcomingAppointmentsForWeek().length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {getUpcomingAppointmentsForWeek().map((appointment, index) => (
                  <div
                    key={appointment._id}
                    className={`p-3 rounded-lg border ${
                      isNextAppointment(appointment)
                        ? 'bg-white border-primary-300 shadow-md'
                        : 'bg-white/80 border-primary-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-primary-600" />
                          <span className="text-sm font-medium text-primary-900">
                            {formatDate(appointment.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-primary-600" />
                          <span className="text-sm font-medium text-primary-900">
                            {appointment.time}
                          </span>
                        </div>
                      </div>
                      {isNextAppointment(appointment) && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 border border-primary-200">
                          <Clock size={12} />
                          Next
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-primary-600" />
                        <span className="text-sm text-primary-800">
                          {appointment.client?.name || appointment.guestInfo?.name || 'Client'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart size={14} className="text-primary-600" />
                        <span className="text-sm text-primary-800">
                          {appointment.session?.name || 'Session'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-primary-700">
                          Rs.{appointment.price || 0}
                        </span>
                      </div>
                    </div>
                    
                    {(appointment.client?.phone || appointment.client?.email) && (
                      <div className="mt-2 pt-2 border-t border-primary-200">
                        <div className="flex items-center gap-4 text-xs text-primary-600">
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar size={32} className="text-primary-400 mx-auto mb-3" />
                <p className="text-primary-700 font-medium">No upcoming appointments this week</p>
                <p className="text-primary-600 text-sm mt-1">All clear for now!</p>
              </div>
            )}
          </div>
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

        {/* Week Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-secondary-200 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-secondary-900">Weekly Schedule</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  const newDate = new Date(selectedWeek);
                  newDate.setDate(selectedWeek.getDate() - 7);
                  setSelectedWeek(newDate);
                }}
                className="btn-secondary text-sm px-4 py-2"
              >
                Previous Week
              </button>
              <button
                onClick={() => setSelectedWeek(new Date())}
                className="btn-primary text-sm px-4 py-2"
              >
                This Week
              </button>
              <button
                onClick={() => {
                  const newDate = new Date(selectedWeek);
                  newDate.setDate(selectedWeek.getDate() + 7);
                  setSelectedWeek(newDate);
                }}
                className="btn-secondary text-sm px-4 py-2"
              >
                Next Week
              </button>
            </div>
          </div>
          
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

        {/* Weekly Schedule Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-7 gap-6"
        >
          {getWeekAppointments().map((dayData, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
              <div className="bg-primary-50 p-4 border-b border-secondary-200">
                <h3 className="text-sm font-semibold text-primary-900">
                  {dayData.date.toLocaleDateString('en-US', { weekday: 'short' })}
                </h3>
                <p className="text-xs text-primary-700">
                  {dayData.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              
              <div className="p-4">
                {dayData.appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar size={24} className="text-secondary-400 mx-auto mb-2" />
                    <p className="text-xs text-secondary-500">No appointments</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dayData.appointments.map((appointment) => (
                      <div
                        key={appointment._id}
                        className={`rounded-lg p-3 border ${
                          isNextAppointment(appointment) && activeTab === 'upcoming'
                            ? 'bg-gradient-to-r from-primary-50 to-primary-100 border-primary-300 shadow-md'
                            : 'bg-secondary-50 border-secondary-200'
                        }`}
                      >
                        {isNextAppointment(appointment) && activeTab === 'upcoming' && (
                          <div className="flex items-center gap-1 mb-2">
                            <Clock size={12} className="text-primary-600" />
                            <span className="text-xs font-medium text-primary-700">Next Appointment</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-medium ${
                            isNextAppointment(appointment) && activeTab === 'upcoming'
                              ? 'text-primary-900'
                              : 'text-secondary-900'
                          }`}>
                            {formatTime(appointment.time)}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                            {getStatusIcon(appointment.status)}
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <p className={`text-xs font-medium ${
                            isNextAppointment(appointment) && activeTab === 'upcoming'
                              ? 'text-primary-900'
                              : 'text-secondary-900'
                          }`}>
                            {appointment.session?.name || 'Session'}
                          </p>
                          <p className={`text-xs ${
                            isNextAppointment(appointment) && activeTab === 'upcoming'
                              ? 'text-primary-800'
                              : 'text-secondary-600'
                          }`}>
                            {appointment.client?.name || appointment.guestInfo?.name || 'Client'}
                          </p>
                          <p className={`text-xs ${
                            isNextAppointment(appointment) && activeTab === 'upcoming'
                              ? 'text-primary-700'
                              : 'text-secondary-500'
                          }`}>
                            Rs.{appointment.price || 0}
                          </p>
                        </div>

                        <div className={`mt-2 pt-2 border-t ${
                          isNextAppointment(appointment) && activeTab === 'upcoming'
                            ? 'border-primary-200'
                            : 'border-secondary-200'
                        }`}>
                          <div className="flex items-center gap-2">
                            {appointment.client?.phone && (
                              <Phone size={12} className={
                                isNextAppointment(appointment) && activeTab === 'upcoming'
                                  ? 'text-primary-500'
                                  : 'text-secondary-400'
                              } />
                            )}
                            {appointment.client?.email && (
                              <Mail size={12} className={
                                isNextAppointment(appointment) && activeTab === 'upcoming'
                                  ? 'text-primary-500'
                                  : 'text-secondary-400'
                              } />
                            )}
                            <span className={`text-xs ${
                              isNextAppointment(appointment) && activeTab === 'upcoming'
                                ? 'text-primary-600'
                                : 'text-secondary-500'
                            }`}>
                              {appointment.location || 'Virtual'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default TherapistDashboard; 