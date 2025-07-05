import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../contexts/BookingContext';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  Calendar, 
  Clock, 
  User, 
  CreditCard, 
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const ReviewStep = ({ goNext, goBack, bookingData, updateBookingData }) => {
  const { user } = useAuth();
  const { cart, getCartTotal, createAppointment, rescheduleAppointment } = useBooking();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const navigate = useNavigate();

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      if (bookingData.appointmentId) {
        // Rescheduling: update the existing appointment
        await rescheduleAppointment(bookingData.appointmentId, bookingData.date, bookingData.time);
        toast.success('Appointment rescheduled successfully!');
        navigate('/my-appointments');
      } else {
        // New booking - validate required data
        if (!cart[0] || !cart[0]._id) {
          throw new Error('Session information is missing. Please select a session.');
        }
        
        if (!bookingData.therapist || !bookingData.therapist._id) {
          throw new Error('Therapist information is missing. Please select a therapist.');
        }
        
        if (!bookingData.date || !bookingData.time) {
          throw new Error('Date and time information is missing. Please select a date and time.');
        }
        
        const appointmentData = {
          session: cart[0],
          date: bookingData.date,
          time: bookingData.time,
          therapist: bookingData.therapist,
          ...(user ? {} : { guestInfo: bookingData.guestInfo }),
          paymentMethod: paymentMethod,
          total: getCartTotal()
        };
        
        const result = await createAppointment(appointmentData);
        if (result.success) {
          if (result.isGuestBooking) {
            toast.success('Appointment booked successfully! Check your email for confirmation.');
            navigate('/');
          } else {
            toast.success('Appointment booked successfully!');
            navigate('/my-appointments');
          }
        }
      }
    } catch (error) {
      console.error('Payment failed:', error);
      if (error.message && error.message.toLowerCase().includes('time slot')) {
        toast.error('This time slot is already booked. Please choose another time.');
        // Go back to time selection (assuming goBack() once goes to therapist, twice to time)
        goBack();
        goBack();
      } else {
        toast.error(error.message || 'Payment failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
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

  // Check if all required data is available
  if (!cart[0] || !bookingData.therapist || !bookingData.date || !bookingData.time) {
    return (
      <div className="text-center py-16">
        <div className="text-red-500 text-lg font-semibold mb-4">Missing Required Information</div>
        <p className="text-secondary-600 mb-6">
          Please ensure you have selected a session, therapist, date, and time before proceeding to payment.
        </p>
        <button
          className="px-6 py-3 rounded-lg bg-primary-600 text-white font-semibold shadow hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400"
          onClick={() => navigate('/booking')}
        >
          Return to Booking
        </button>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-3xl font-extrabold mb-8 text-center tracking-tight text-primary-700">Review & Payment</h2>
      {/* Booking Summary */}
      <div className="bg-secondary-50 rounded-2xl p-6 mb-8 shadow-sm border border-secondary-100">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Booking Summary</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{cart[0]?.icon}</span>
              <div>
                <h4 className="font-semibold text-secondary-900">{cart[0]?.name}</h4>
                <p className="text-sm text-secondary-500">{cart[0]?.duration} min • <span className="font-bold text-primary-600">Rs.{cart[0]?.price}</span></p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-secondary-200 pt-4 space-y-3">
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-secondary-400" />
              <div className="text-secondary-700">{formatDate(bookingData.date)} at {bookingData.time}</div>
            </div>
            
            <div className="flex items-center gap-3">
              <User size={16} className="text-secondary-400" />
              <div className="flex items-center gap-2">
                <img src={bookingData.therapist?.photo} alt={bookingData.therapist?.name} className="w-8 h-8 rounded-full object-cover border border-secondary-200" />
                <span>{bookingData.therapist?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Information */}
      {user && (
        <div className="bg-secondary-50 rounded-2xl p-6 mb-8 shadow-sm border border-secondary-100">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Your Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User size={16} className="text-secondary-400" />
              <div className="text-secondary-700">{user.name}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-secondary-400">📧</span>
              <div className="text-secondary-700">{user.email}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-secondary-400">📞</span>
              <div className="text-secondary-700">{user.phone}</div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Payment Method</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 border border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50 transition-all">
            <input
              type="radio"
              name="payment"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="text-primary-600"
            />
            <CreditCard size={20} className="text-secondary-400" />
            <span className="font-medium">Credit/Debit Card</span>
          </label>
          
          <label className="flex items-center gap-3 p-4 border border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50 transition-all">
            <input
              type="radio"
              name="payment"
              value="paypal"
              checked={paymentMethod === 'paypal'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="text-primary-600"
            />
            <span className="font-medium">PayPal</span>
          </label>
        </div>
      </div>

      {/* Total */}
      <div className="border-t border-secondary-200 pt-4 mb-8">
        <div className="flex items-center justify-between text-lg font-semibold">
          <span>Total</span>
          <span className="text-primary-600">Rs.{getCartTotal()}</span>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          className="px-6 py-3 rounded-lg bg-secondary-100 text-secondary-700 font-semibold shadow hover:bg-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-400 flex items-center gap-2 transition-all"
          onClick={goBack}
        >
          Back
        </button>
        <button
          className="px-6 py-3 rounded-lg bg-primary-600 text-white font-semibold shadow hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400 flex items-center gap-2 disabled:opacity-50 transition-all"
          onClick={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              Processing... <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            </>
          ) : (
            <>
              Complete Payment <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </>
  );
};

export default ReviewStep; 