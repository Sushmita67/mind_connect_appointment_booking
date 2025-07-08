import React, { useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const dummyMessages = [
  "You are not alone. We're here for you, every step of the way! 💖",
  "Your feelings matter. Remember, brighter days are ahead! 🌈",
  "You are stronger than you think, and you are cared for deeply. 🤗",
  "This is a safe space. We're so glad you're here. 🫶",
  "You are valued, loved, and never alone on this journey. 💛",
  "Every step you take is a step toward healing. We're with you! 🌟"
];

const PopupModal = ({ isOpen, onClose }) => {
  // Pick a random message on each mount
  const message = useMemo(() => {
    const idx = Math.floor(Math.random() * dummyMessages.length);
    return dummyMessages[idx];
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Changed from 5000 to 4000
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed top-24 right-6 z-50 flex items-start justify-end pointer-events-none">
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, x: 40, y: -20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 40, y: -20 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-secondary-100 flex flex-col items-center pointer-events-auto"
        >
          <div className="text-2xl font-bold text-primary-600 mb-2 text-center">
            Welcome! 💚
          </div>
          <div className="text-lg text-secondary-800 mb-4 text-center">
            {message}
          </div>
          {/* <button
            onClick={onClose}
            className="mt-2 px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold flex items-center gap-2 shadow-sm transition-colors"
          >
            <span role="img" aria-label="smile">😊</span> Close
          </button> */}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PopupModal; 