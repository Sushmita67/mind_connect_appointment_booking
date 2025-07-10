import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import { useAuth } from '../contexts/AuthContext';
import SessionStep from './booking/SessionStep';
import DateStep from './booking/DateStep';
import TimeStep from './booking/TimeStep';
import TherapistStep from './booking/TherapistStep';
import GuestInfoStep from './booking/GuestInfoStep';
import ReviewStep from './booking/ReviewStep';
import PaymentPage from './booking/PaymentPage';

const BookingPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const selectedSession = location.state?.session;
  
  const { 
    currentStep, 
    setCurrentStep, 
    bookingData, 
    updateBookingData, 
    cart 
  } = useBooking();

  // Conditionally define steps based on user authentication
  const steps = [
    { label: 'Session', component: SessionStep },
    { label: 'Therapist', component: TherapistStep },
    { label: 'Date', component: DateStep },
    { label: 'Time', component: TimeStep },
    // Only include GuestInfoStep if user is not logged in
    ...(user ? [] : [{ label: 'Your Info', component: GuestInfoStep }]),
    { label: 'Review', component: ReviewStep },
    { label: 'Payment', component: PaymentPage },
  ];

  // Stepper logic
  const goNext = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 0));
  const goTo = (idx) => setCurrentStep(idx);

  const StepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-secondary-50 py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
        {/* Stepper */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, idx) => (
            <div key={s.label} className="flex-1 flex flex-col items-center">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-white mb-1 transition-all duration-200 ${
                  idx < currentStep
                    ? 'bg-primary-400' : idx === currentStep
                    ? 'bg-primary-600 scale-110 shadow-lg' : 'bg-secondary-200'
                }`}
              >
                {idx + 1}
              </div>
              <span className={`text-xs text-center ${idx === currentStep ? 'text-primary-700 font-semibold' : 'text-secondary-500'}`}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <StepComponent 
              goNext={goNext} 
              goBack={goBack} 
              goTo={goTo}
              bookingData={bookingData}
              updateBookingData={updateBookingData}
              selectedSession={selectedSession}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BookingPage; 