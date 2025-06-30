import React, { useEffect } from 'react';
import { useBooking } from '../../contexts/BookingContext';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const SessionStep = ({ goNext, selectedSession }) => {
  const { sessions, cart, addToCart, removeFromCart, loading } = useBooking();

  // Pre-select session if passed from landing page
  useEffect(() => {
    if (selectedSession && cart.length === 0) {
      addToCart(selectedSession);
    }
  }, [selectedSession, cart.length, addToCart]);

  const isSelected = (id) => cart.some((item) => item._id === id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-3xl font-extrabold mb-8 text-center tracking-tight text-primary-700">Choose Your Session</h2>
      {selectedSession && cart.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-8 flex items-center justify-center shadow-sm"
        >
          <p className="text-primary-700 text-base font-medium flex items-center gap-2">
            <span className="text-lg">✓</span> {selectedSession.name} has been pre-selected for you
          </p>
        </motion.div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
        {sessions.map((session) => (
          <motion.div
            key={session._id}
            whileHover={{ scale: 1.04 }}
            className={`rounded-2xl border transition-all duration-200 shadow group p-6 cursor-pointer bg-white hover:shadow-lg focus-within:ring-2 focus-within:ring-primary-300 outline-none ${
              isSelected(session._id)
                ? 'border-primary-500 ring-2 ring-primary-200 bg-primary-50' : 'border-secondary-200'
            }`}
            tabIndex={0}
            onClick={() =>
              isSelected(session._id)
                ? removeFromCart(session._id)
                : addToCart(session)
            }
            onKeyPress={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                isSelected(session._id)
                  ? removeFromCart(session._id)
                  : addToCart(session);
              }
            }}
          >
            <div className="flex items-center gap-4 mb-2">
              <span className="text-4xl">{session.icon}</span>
              <div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-1">{session.name}</h3>
                <p className="text-sm text-secondary-500">{session.duration} min &bull; <span className="font-bold text-primary-600">Rs.{session.price}</span></p>
              </div>
            </div>
            <p className="text-secondary-700 text-sm mb-2 line-clamp-2">{session.description}</p>
            {session.features && session.features.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-semibold text-secondary-700 mb-1">Features:</p>
                <div className="flex flex-wrap gap-2">
                  {session.features.slice(0, 2).map((feature, index) => (
                    <span key={index} className="text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded-full">
                      {feature}
                    </span>
                  ))}
                  {session.features.length > 2 && (
                    <span className="text-xs text-secondary-500">
                      +{session.features.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            )}
            {isSelected(session._id) && (
              <div className="mt-3 text-primary-600 text-xs font-bold flex items-center gap-1">
                Selected <ArrowRight size={14} />
              </div>
            )}
          </motion.div>
        ))}
      </div>
      <div className="flex justify-end">
        <button
          className="px-6 py-3 rounded-lg bg-primary-600 text-white font-semibold shadow hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400 flex items-center gap-2 disabled:opacity-50 transition-all"
          onClick={goNext}
          disabled={cart.length === 0}
        >
          Next <ArrowRight size={18} />
        </button>
      </div>
    </>
  );
};

export default SessionStep; 