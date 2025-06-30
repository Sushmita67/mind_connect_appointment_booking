import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle } from 'lucide-react';

const ConfirmationStep = () => {
  const { user } = useAuth();

  return (
    <div className="text-center py-16">
      <CheckCircle size={72} className="mx-auto text-green-500 mb-6" />
      <h2 className="text-3xl font-extrabold mb-4 text-primary-700">Appointment Confirmed!</h2>
      {user ? (
        <p className="text-secondary-700 mb-10 text-lg">
          Thank you for booking your session. Your appointment has been confirmed and added to your account.
        </p>
      ) : (
        <p className="text-secondary-700 mb-10 text-lg">
          Thank you for booking your session. A confirmation email has been sent to your email address with all the details.
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/" className="px-6 py-3 rounded-lg bg-secondary-100 text-secondary-700 font-semibold shadow hover:bg-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-400 text-lg transition-all">Back to Home</Link>
        {user ? (
          <Link to="/my-appointments" className="px-6 py-3 rounded-lg bg-primary-600 text-white font-semibold shadow hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400 text-lg transition-all">View My Appointments</Link>
        ) : (
          <Link to="/booking" className="px-6 py-3 rounded-lg bg-primary-600 text-white font-semibold shadow hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400 text-lg transition-all">Book Another</Link>
        )}
      </div>
    </div>
  );
};

export default ConfirmationStep; 