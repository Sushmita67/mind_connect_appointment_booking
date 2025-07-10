import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../contexts/BookingContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import eSewaLogo from '../../assets/e-sewa-logo.png';
import khaltiLogo from '../../assets/khalti-logo-.png';
import imeLogo from '../../assets/ime-logo.png';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const paymentOptions = [
  {
    label: 'eSewa',
    value: 'esewa',
    logo: eSewaLogo,
  },
  {
    label: 'Khalti',
    value: 'khalti',
    logo: khaltiLogo,
  },
  {
    label: 'IME Pay',
    value: 'imepay',
    logo: imeLogo,
  },
];

const PaymentPage = ({ goBack, bookingData }) => {
  const { user } = useAuth();
  const { cart, getCartTotal, createAppointment, rescheduleAppointment } = useBooking();
  const [paymentMethod, setPaymentMethod] = useState('esewa');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      if (bookingData.appointmentId) {
        await rescheduleAppointment(bookingData.appointmentId, bookingData.date, bookingData.time);
        toast.success('Appointment rescheduled successfully!');
        navigate('/my-appointments');
      } else {
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
          total: getCartTotal(),
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
        goBack();
        goBack();
      } else {
        toast.error(error.message || 'Payment failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-10">
      <h2 className="text-3xl font-extrabold mb-8 text-center tracking-tight text-primary-700">Payments</h2>
      <div className="bg-secondary-50 rounded-2xl p-6 mb-8 shadow-sm border border-secondary-100">
        <div className="mb-6 font-semibold text-secondary-900">Select Payment Methods</div>
        <div className="flex gap-8 mb-8">
          {paymentOptions.map((option) => (
            <label
              key={option.value}
              className={`flex flex-col items-center border rounded-xl px-8 py-4 cursor-pointer transition-all ${paymentMethod === option.value ? 'border-primary-600 bg-primary-50' : 'border-secondary-200 bg-white'}`}
            >
              <img src={option.logo} alt={option.label} className="w-12 h-12 object-contain mb-2" />
              <span className="font-medium mb-2">{option.label}</span>
              <input
                type="radio"
                name="paymentMethod"
                value={option.value}
                checked={paymentMethod === option.value}
                onChange={() => setPaymentMethod(option.value)}
                className="accent-primary-600 mb-1"
              />
            </label>
          ))}
        </div>
        <div className="flex items-center justify-between text-lg font-semibold mb-8">
          <span>Total Amount :</span>
          <span className="text-primary-600">Rs. {getCartTotal()}</span>
        </div>
        <div className="flex justify-between mt-8">
          <button
            className="px-6 py-3 rounded-lg border border-secondary-300 bg-white text-secondary-700 font-semibold shadow hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-secondary-400 flex items-center gap-2 transition-all"
            onClick={goBack}
            disabled={isProcessing}
          >
            <ArrowLeft size={18} /> Back
          </button>
          <button
            className="px-6 py-3 rounded-lg bg-primary-700 text-white font-semibold shadow hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-400 flex items-center gap-2 disabled:opacity-50 transition-all"
            onClick={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : (<><span>Confirm Payment</span> <ArrowRight size={18} /></>)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage; 