import React, { useState } from 'react';
import { useBooking } from '../../contexts/BookingContext';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const GuestInfoStep = ({ goNext, goBack, bookingData, updateBookingData }) => {
  const [form, setForm] = useState(bookingData?.guestInfo || { name: '', email: '', phone: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    updateBookingData('guestInfo', form);
    goNext();
  };

  const isValid = form.name && form.email && form.phone;

  return (
    <>
      <h2 className="text-3xl font-extrabold mb-8 text-center tracking-tight text-primary-700">Your Information</h2>
      <div className="space-y-6 mb-10">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          className="w-full px-4 py-3 rounded-lg border border-secondary-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-base text-secondary-900 shadow-sm transition-all"
          value={form.name}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          className="w-full px-4 py-3 rounded-lg border border-secondary-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-base text-secondary-900 shadow-sm transition-all"
          value={form.email}
          onChange={handleChange}
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          className="w-full px-4 py-3 rounded-lg border border-secondary-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-base text-secondary-900 shadow-sm transition-all"
          value={form.phone}
          onChange={handleChange}
        />
      </div>
      <div className="flex justify-between">
        <button className="px-6 py-3 rounded-lg bg-secondary-100 text-secondary-700 font-semibold shadow hover:bg-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-400 flex items-center gap-2 transition-all" onClick={goBack}>
          <ArrowLeft size={18} /> Back
        </button>
        <button
          className="px-6 py-3 rounded-lg bg-primary-600 text-white font-semibold shadow hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400 flex items-center gap-2 disabled:opacity-50 transition-all"
          onClick={handleNext}
          disabled={!isValid}
        >
          Next <ArrowRight size={18} />
        </button>
      </div>
    </>
  );
};

export default GuestInfoStep; 