import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';
import { 
  Home, 
  User, 
  ShoppingCart, 
  Menu, 
  X, 
  Calendar,
  LogOut,
  Heart,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const NavigationBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cart } = useBooking();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const navItems = [
    // Only show Home for non-therapists
    ...(user?.role !== 'therapist' ? [{ name: 'Home', path: '/', icon: Home }] : []),
    // Only show booking for non-therapists
    ...(user?.role !== 'therapist' ? [{ name: 'Book Appointment', path: '/booking', icon: Calendar }] : []),
    ...(user ? [{ 
      name: user?.role === 'therapist' ? 'Dashboard' : 'My Appointments', 
      path: '/my-appointments', 
      icon: Heart 
    }] : []),
  ];

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-secondary-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-20 h-20 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <img
                  src="/src/assets/mind-connect-logo.svg"
                  alt="Mind Connect Logo"
                  className="w-16 object-contain group-hover:scale-105 transition-transform"
              />
            </div>

            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              MindConnect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'text-primary-600 bg-primary-50 border border-primary-200'
                      : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Cart - Only show for non-therapists */}
            {user?.role !== 'therapist' && (
              <button
                type="button"
                className="relative p-2 text-secondary-600 hover:text-primary-600 transition-colors group"
                onClick={() => setIsCartOpen((v) => !v)}
              >
                <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                {cart.length > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
                  >
                    {cart.length}
                  </motion.div>
                )}
              </button>
            )}

            {/* Cart Modal/Dropdown - Only show for non-therapists */}
            {user?.role !== 'therapist' && (
              <AnimatePresence>
                {isCartOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-24 top-20 w-96 min-h-[300px] bg-white rounded-xl shadow-lg border border-secondary-200 z-50 p-8"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-lg text-secondary-900">Cart</span>
                    <button onClick={() => setIsCartOpen(false)} className="text-secondary-400 hover:text-secondary-700"><X size={18} /></button>
                  </div>
                  {cart.length === 0 ? (
                    <div className="text-secondary-500 text-center py-16">Your cart is empty.</div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">{cart[0]?.icon}</span>
                        <div>
                          <h4 className="font-semibold text-secondary-900">{cart[0]?.name}</h4>
                          <p className="text-sm text-secondary-500">{cart[0]?.duration} min • <span className="font-bold text-primary-600">Rs.{cart[0]?.price}</span></p>
                        </div>
                      </div>
                      <button
                        className="w-full px-4 py-3 rounded-lg bg-primary-600 text-white font-semibold shadow hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400 flex items-center justify-center gap-2 transition-all"
                        onClick={() => {
                          setIsCartOpen(false);
                          navigate('/booking');
                        }}
                      >
                        Book Appointment <ArrowRight size={18} />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            )}

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-secondary-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                    <User size={16} className="text-primary-600" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-secondary-700">
                    {user.name}
                  </span>
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-1"
                    >
                      <Link
                        to="/account"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User size={16} />
                        <span>Account</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 w-full text-left transition-colors"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-secondary-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-secondary-600 hover:text-primary-600 hover:bg-secondary-50 transition-colors"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-secondary-200 bg-white/95 backdrop-blur-sm"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      location.pathname === item.path
                        ? 'text-primary-600 bg-primary-50 border border-primary-200'
                        : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              {!user && (
                <div className="pt-4 pb-3 border-t border-secondary-200">
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-base font-medium text-secondary-600 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-3 py-2 text-base font-medium text-primary-600 hover:text-primary-700 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default NavigationBar; 