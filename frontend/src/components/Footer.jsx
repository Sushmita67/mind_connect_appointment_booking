import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const faqs = [
  {
    question: 'How do I book a therapy session?',
    answer: 'You can book a session by clicking on "Book Your Session" and following the steps to select a therapist, date, and time.'
  },
  {
    question: 'Can I reschedule or cancel my appointment?',
    answer: 'Yes, you can manage your appointments from the "My Appointments" page after logging in.'
  },
  {
    question: 'Is my information confidential?',
    answer: 'Absolutely. All your personal and session information is kept strictly confidential and secure.'
  },
  {
    question: 'How do I contact support?',
    answer: 'You can reach out to our support team using the contact form below or by emailing support@mindconnect.com.'
  }
];

function ContactModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-secondary-400 hover:text-secondary-700 text-2xl font-bold">&times;</button>
        <h3 className="text-2xl font-bold mb-4 text-center text-secondary-900">Contact Support</h3>
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Name</label>
            <input type="text" name="name" required className="input-field w-full" placeholder="Your Name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Email</label>
            <input type="email" name="email" required className="input-field w-full" placeholder="Your Email" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Message</label>
            <textarea name="message" required rows="4" className="input-field w-full" placeholder="How can we help you?"></textarea>
          </div>
          <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition">Send Message</button>
        </form>
      </div>
    </div>
  );
}

const Footer = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const toggleFAQ = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <footer className="bg-secondary-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Important Links */}
        <div>
          <h3 className="font-bold text-lg mb-4">Important Links</h3>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li><Link to="/booking" className="hover:underline">Book a Session</Link></li>
            <li><Link to="/my-appointments" className="hover:underline">My Appointments</Link></li>
            <li><Link to="/signup" className="hover:underline">Create Account</Link></li>
            <li><Link to="/help" className="hover:underline">Help & Documentation</Link></li>
          </ul>
        </div>

        {/* Help & Documentation */}
        <div id="help" className="md:col-span-2">
          <h3 className="font-bold text-lg mb-4">Help & Documentation</h3>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx}>
                <button
                  className="w-full text-left font-semibold focus:outline-none flex justify-between items-center"
                  onClick={() => toggleFAQ(idx)}
                  aria-expanded={openIndex === idx}
                >
                  {faq.question}
                  <span>{openIndex === idx ? '-' : '+'}</span>
                </button>
                {openIndex === idx && (
                  <p className="mt-2 text-sm text-secondary-200">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div>
          <h3 className="font-bold text-lg mb-4">Contact Us</h3>
          <p className="mb-2 text-secondary-200">Have more questions or need support?</p>
          <p className="mb-2 text-secondary-200">Email: <a href="mailto:support@mindconnect.com" className="underline">support@mindconnect.com</a></p>
          <p className="mb-2 text-secondary-200">Phone: <a href="tel:+1234567890" className="underline">+1 234 567 890</a></p>
          <button
            onClick={() => setContactModalOpen(true)}
            className="inline-block mt-4 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded transition"
          >
            Contact Support
          </button>
        </div>
      </div>
      <ContactModal isOpen={contactModalOpen} onClose={() => setContactModalOpen(false)} />
      <div className="mt-12 text-center text-secondary-400 text-sm">&copy; {new Date().getFullYear()} MindConnect. All rights reserved.</div>
    </footer>
  );
};

export default Footer; 