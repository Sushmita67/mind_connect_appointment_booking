import React from 'react';

const steps = [
  'Session',
  'Date',
  'Time',
  'Therapist',
  'Your Info',
  'Review',
  'Confirmation'
];

const BookingLayout = ({ currentStep, children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-8 px-2">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 md:p-10 relative">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-8">
          {steps.slice(0, 6).map((label, idx) => (
            <div key={label} className="flex-1 flex flex-col items-center">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-200 ${
                  idx < currentStep
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : idx === currentStep
                    ? 'bg-white border-primary-500 text-primary-600'
                    : 'bg-white border-secondary-200 text-secondary-400'
                }`}
              >
                {idx + 1}
              </div>
              <span className={`mt-2 text-xs font-medium ${idx === currentStep ? 'text-primary-600' : 'text-secondary-400'}`}>{label}</span>
            </div>
          ))}
        </div>
        {/* Divider */}
        <div className="border-b border-secondary-100 mb-8" />
        {/* Step Content */}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default BookingLayout; 