import React, { useState } from 'react';
import { useBooking } from '../../contexts/BookingContext';
import { motion } from 'framer-motion';
import { User, Star, ArrowRight } from 'lucide-react';

const TherapistStep = ({ goNext, goBack, bookingData, updateBookingData }) => {
  const { therapists, loading } = useBooking();
  const [localTherapist, setLocalTherapist] = useState(bookingData?.therapist || null);

  const handleNext = () => {
    updateBookingData('therapist', localTherapist);
    goNext();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-3xl font-extrabold mb-8 text-center tracking-tight text-primary-700">Choose Your Therapist</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
        {therapists.map((therapist) => (
          <motion.div
            key={therapist._id}
            whileHover={{ scale: 1.04 }}
            className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer bg-white shadow group hover:shadow-lg focus-within:ring-2 focus-within:ring-primary-300 outline-none ${
              localTherapist?._id === therapist._id
                ? 'border-primary-500 ring-2 ring-primary-200 bg-primary-50' : 'border-secondary-200'
            }`}
            tabIndex={0}
            onClick={() => setLocalTherapist(therapist)}
            onKeyPress={e => {
              if (e.key === 'Enter' || e.key === ' ') setLocalTherapist(therapist);
            }}
          >
            <div className="flex items-start gap-4 mb-2">
              <img
                src={therapist.photo || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face'}
                alt={therapist.name}
                className="w-16 h-16 rounded-full object-cover border border-secondary-200"
              />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-secondary-900 mb-1">{therapist.name}</h3>
                <p className="text-primary-600 text-sm mb-2 font-medium">{therapist.specialization}</p>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.floor(therapist.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                    />
                  ))}
                  <span className="text-sm text-secondary-600 ml-1">
                    ({therapist.reviews || 0})
                  </span>
                </div>
                <p className="text-sm text-secondary-600 mb-2">{therapist.experience} experience</p>
                <p className="text-sm text-secondary-500 line-clamp-2">{therapist.bio}</p>
              </div>
            </div>
            {localTherapist?._id === therapist._id && (
              <div className="mt-3 text-primary-600 text-xs font-bold flex items-center gap-1">
                Selected <ArrowRight size={14} />
              </div>
            )}
          </motion.div>
        ))}
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
          onClick={handleNext}
          disabled={!localTherapist}
        >
          Next <ArrowRight size={18} />
        </button>
      </div>
    </>
  );
};

export default TherapistStep; 