import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config/api';

const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    session: null,
    date: null,
    time: null,
    therapist: null,
    guestInfo: null,
    paymentMethod: null
  });

  const [sessions, setSessions] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);
  const [prescriptionError, setPrescriptionError] = useState('');

  // Fetch sessions and therapists on mount
  useEffect(() => {
    fetchSessions();
    fetchTherapists();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions`);
      const data = await response.json();
      if (data.success) {
        setSessions(data.data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchTherapists = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/therapists`);
      const data = await response.json();
      if (data.success) {
        setTherapists(data.data);
      }
    } catch (error) {
      console.error('Error fetching therapists:', error);
    } finally {
      setLoading(false);
    }
  };

  // Returns available times for a therapist on a given date
  const getAvailableTimes = (therapistId, date) => {
    const allTimes = [
      '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
    ];
    if (!therapistId || !date) return allTimes;
    // Find appointments for this therapist and date
    const bookedTimes = appointments
      .filter(apt => apt.therapist && apt.therapist._id === therapistId && apt.date === date && apt.status !== 'cancelled')
      .map(apt => apt.time);
    return allTimes.filter(time => !bookedTimes.includes(time));
  };

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const addToCart = (session) => {
    setCart([session]);
  };

  const removeFromCart = (sessionId) => {
    setCart(cart.filter(item => item._id !== sessionId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const updateBookingData = (step, data) => {
    setBookingData(prev => ({
      ...prev,
      [step]: data
    }));
  };

  const createAppointment = async (appointmentData) => {
    try {
      // Validate appointment data
      if (!appointmentData.session || !appointmentData.session._id) {
        throw new Error('Session information is required');
      }
      
      if (!appointmentData.therapist || !appointmentData.therapist._id) {
        throw new Error('Therapist information is required');
      }
      
      if (!appointmentData.date || !appointmentData.time) {
        throw new Error('Date and time are required');
      }
      
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sessionId: appointmentData.session._id,
          therapistId: appointmentData.therapist._id,
          date: appointmentData.date,
          time: appointmentData.time,
          duration: appointmentData.session.duration,
          price: appointmentData.session.price,
          location: appointmentData.location || "Virtual Session",
          paymentMethod: appointmentData.paymentMethod,
          ...(appointmentData.guestInfo && { guestInfo: appointmentData.guestInfo })
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const newAppointment = data.data;
        setAppointments(prev => [newAppointment, ...prev]);
        clearCart();
        setCurrentStep(0);
        setBookingData({
          session: null,
          date: null,
          time: null,
          therapist: null,
          guestInfo: null,
          paymentMethod: null
        });
        
        return {
          success: true,
          appointment: newAppointment,
          isGuestBooking: !token
        };
      } else {
        throw new Error(data.message || 'Failed to create appointment');
      }
    } catch (error) {
      throw new Error(error.message || 'Failed to create appointment');
    }
  };

  // Memoized fetch functions to avoid infinite update loops
  const fetchUserAppointments = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/appointments/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setAppointments(data.data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  }, []);

  const fetchTherapistAppointments = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/appointments/therapist`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setAppointments(data.data);
      }
    } catch (error) {
      console.error('Error fetching therapist appointments:', error);
    }
  }, []);

  // Fetch appointments for a therapist by id and date (public)
  const fetchTherapistAppointmentsPublic = async (therapistId, date) => {
    try {
      let url = `${API_BASE_URL}/appointments/therapist/${therapistId}`;
      if (date) {
        url += `?date=${date}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        return data.data;
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  };

  // Prescription context methods
  const fetchPrescriptionByAppointment = useCallback(async (appointmentId) => {
    setPrescriptionLoading(true);
    setPrescriptionError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/prescriptions/appointment/${appointmentId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        setSelectedPrescription(data.data);
        return data.data;
      } else {
        setSelectedPrescription(null);
        setPrescriptionError(data.message || 'No prescription found');
        return null;
      }
    } catch (error) {
      setPrescriptionError('Failed to fetch prescription');
      setSelectedPrescription(null);
      return null;
    } finally {
      setPrescriptionLoading(false);
    }
  }, []);

  const createOrUpdatePrescription = useCallback(async ({ appointmentId, therapistId, patientId, notes, prescriptionId }) => {
    setPrescriptionLoading(true);
    setPrescriptionError('');
    try {
      const token = localStorage.getItem('token');
      const method = prescriptionId ? 'PUT' : 'POST';
      const url = prescriptionId ? `${API_BASE_URL}/prescriptions/${prescriptionId}` : `${API_BASE_URL}/prescriptions`;
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          appointment: appointmentId,
          therapist: therapistId,
          patient: patientId,
          notes
        })
      });
      const data = await response.json();
      if ((response.ok && data.success) || (response.status === 200 && data.success)) {
        setSelectedPrescription(data.data);
        return { success: true, data: data.data };
      } else {
        setPrescriptionError(data.message || 'Failed to save prescription');
        return { success: false, error: data.message };
      }
    } catch (err) {
      setPrescriptionError('Failed to save prescription');
      return { success: false, error: 'Failed to save prescription' };
    } finally {
      setPrescriptionLoading(false);
    }
  }, []);

  const deletePrescription = useCallback(async (prescriptionId) => {
    setPrescriptionLoading(true);
    setPrescriptionError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/prescriptions/${prescriptionId}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSelectedPrescription(null);
        return { success: true };
      } else {
        setPrescriptionError(data.message || 'Failed to delete prescription');
        return { success: false, error: data.message };
      }
    } catch (err) {
      setPrescriptionError('Failed to delete prescription');
      return { success: false, error: 'Failed to delete prescription' };
    } finally {
      setPrescriptionLoading(false);
    }
  }, []);

  const cancelAppointment = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setAppointments(prev => 
          prev.map(apt => 
            apt._id === appointmentId 
              ? { ...apt, status: 'cancelled' }
              : apt
          )
        );
      } else {
        throw new Error(data.message || 'Failed to cancel appointment');
      }
    } catch (error) {
      throw new Error(error.message || 'Failed to cancel appointment');
    }
  };

  const rescheduleAppointment = async (appointmentId, newDate, newTime) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/datetime`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: newDate,
          time: newTime
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAppointments(prev => 
          prev.map(apt => 
            apt._id === appointmentId 
              ? { ...apt, date: newDate, time: newTime }
              : apt
          )
        );
        return { success: true, data: data.data };
      } else {
        throw new Error(data.message || 'Failed to reschedule appointment');
      }
    } catch (error) {
      throw new Error(error.message || 'Failed to reschedule appointment');
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price, 0);
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments.filter(apt => 
      new Date(apt.date) > now && apt.status !== 'cancelled'
    );
  };

  const getPastAppointments = () => {
    const now = new Date();
    return appointments.filter(apt => 
      new Date(apt.date) <= now || apt.status === 'completed'
    );
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    getCartTotal,
    currentStep,
    setCurrentStep,
    bookingData,
    updateBookingData,
    createAppointment,
    appointments,
    fetchUserAppointments,
    fetchTherapistAppointments,
    cancelAppointment,
    rescheduleAppointment,
    getUpcomingAppointments,
    getPastAppointments,
    sessions,
    therapists,
    loading,
    getAvailableTimes,
    getAvailableDates,
    // Prescription context
    prescriptions,
    selectedPrescription,
    prescriptionLoading,
    prescriptionError,
    fetchPrescriptionByAppointment,
    createOrUpdatePrescription,
    deletePrescription,
    fetchTherapistAppointmentsPublic,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}; 