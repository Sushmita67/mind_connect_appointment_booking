import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBooking } from '../contexts/BookingContext';
import { 
  ArrowRight, 
  Star, 
  Clock, 
  Users, 
  Shield, 
  Sparkles,
  Calendar,
  Heart,
  CheckCircle
} from 'lucide-react';

import heroImage1 from '../assets/hero-1.jpg';
import heroImage2 from '../assets/hero-2.jpg';
import heroImage3 from '../assets/hero-3.jpg';
import heroImage4 from '../assets/hero-4.jpg';
import PopupModal from '../components/PopupModal';
import { useAuth } from '../contexts/AuthContext';
import instagramLogo from '../assets/instagram-logo.png';
import pexelsPixabay from '../assets/mental health images/pexels-pixabay-159211.jpg';
import pexelsShvetsa from '../assets/mental health images/pexels-shvetsa-4672710.jpg';
import pexelsBrettSayles from '../assets/mental health images/pexels-brett-sayles-2821220.jpg';
import pexelsFotiosPhotos from '../assets/mental health images/pexels-fotios-photos-3972441.jpg';
import pexelsVieStudio from '../assets/mental health images/pexels-vie-studio-7006256.jpg';
import pexelsDanielReche from '../assets/mental health images/pexels-daniel-reche-718241-3601097.jpg';
import pexelsEmmaBauso from '../assets/mental health images/pexels-emma-bauso-1183828-3585811.jpg';
import pexelsCottonbro from '../assets/mental health images/pexels-cottonbro-4098362.jpg';


const LandingPage = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { sessions, therapists } = useBooking();
  const { user } = useAuth();
  const [showPopup, setShowPopup] = useState(false);

  const heroImages = [
    heroImage1,
    heroImage2,
    heroImage3,
    heroImage4,
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  useEffect(() => {
    if (user?.role === 'client' && localStorage.getItem('showClientWelcome') === 'true') {
      const timer = setTimeout(() => {
        setShowPopup(true);
        localStorage.removeItem('showClientWelcome');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const features = [
    {
      icon: Shield,
      title: 'Safe & Confidential',
      description: 'Your privacy and confidentiality are our top priorities'
    },
    {
      icon: Users,
      title: 'Expert Therapists',
      description: 'Licensed professionals with years of experience'
    },
    {
      icon: Clock,
      title: 'Flexible Scheduling',
      description: 'Book appointments that fit your schedule'
    },
    {
      icon: Heart,
      title: 'Personalized Care',
      description: 'Tailored treatment plans for your unique needs'
    }
  ];

  const testimonials = [
    {
      name: 'Lata Maya',
      rating: 5,
      text: 'The calm sessions have completely transformed my approach to stress management. Highly recommend!',
      avatar: 'http://localhost:4000/uploads/client-1.jpeg'
    },
    {
      name: 'Pema Dumjan',
      rating: 3,
      text: 'Dr. Lata helped me overcome my anxiety. The therapy sessions were incredibly effective.',
      avatar: 'http://localhost:4000/uploads/client-2.jpg'
    },
    {
      name: 'Tenzing Chogyal Sherpa',
      rating: 4,
      text: 'The meditation sessions are perfect for finding inner peace. I feel so much better now.',
      avatar: 'http://localhost:4000/uploads/client-3.jpg'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-start overflow-hidden pl-10">
        {/* Background Images */}
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <motion.div
              key={index}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: currentImageIndex === index ? 1 : 0 }}
              transition={{ duration: 1 }}
            >
              <img
                src={image}
                alt="Mental health therapy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40" />
            </motion.div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-left text-white px-4 max-w-4xl ml-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              Find Your
              <span className="block bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                Inner Peace
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto">
              Professional mental health therapy sessions designed
              <br />
              to help you heal, grow and become happy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 ">
              <Link
                to="/booking"
                className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
              >
                Book Your Session
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/my-appointments"
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 hover:bg-white/20 flex items-center justify-center gap-2"
              >
                View Appointments
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-white/60 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Why Choose MindConnect?
            </h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              We provide comprehensive mental health care with a focus on your well-being and personal growth
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center group"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Icon size={32} className="text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-secondary-600">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Our Therapy Sessions
            </h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              Choose from our range of specialized therapy sessions designed to meet your unique needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {sessions.map((session, index) => (
              <motion.div
                key={session._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={session.image}
                    alt={session.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-4 left-4 text-4xl">
                    {session.icon}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                    {session.name}
                  </h3>
                  <p className="text-secondary-600 mb-4">
                    {session.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-secondary-500">
                      <Clock size={16} />
                      <span className="text-sm">{session.duration} min</span>
                    </div>
                    <div className="text-2xl font-bold text-primary-600">
                      Rs.{session.price}
                    </div>
                  </div>
                  <Link
                    to="/booking"
                    state={{ session }}
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 group"
                  >
                    Book Session
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Therapists Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Meet Our Expert Therapists
            </h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              Our licensed professionals are here to support your mental health journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {therapists.map((therapist, index) => (
              <motion.div
                key={therapist._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg p-6 text-center group hover:shadow-xl transition-shadow"
              >
                <div className="relative mb-4">
                  <img
                    src={therapist.photo}
                    alt={therapist.name}
                    className="w-24 h-24 rounded-full mx-auto object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1">
                    <CheckCircle size={16} />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-1">
                  {therapist.name}
                </h3>
                <p className="text-primary-600 text-sm mb-2">
                  {therapist.specialization}
                </p>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(therapist.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                    />
                  ))}
                  <span className="text-sm text-secondary-600 ml-1">
                    ({therapist.reviews})
                  </span>
                </div>
                <p className="text-sm text-secondary-600 mb-4">
                  {therapist.experience} experience
                </p>
                <p className="text-sm text-secondary-500">
                  {therapist.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              Real stories from people who have transformed their lives with our therapy sessions
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-secondary-600 mb-4 italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-secondary-900">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-secondary-500">
                      Verified Client
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram/FOLLOW US Section */}
      <section className="pt-20 bg-white p-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">FOLLOW US</h2>
            <div className="w-16 h-1 bg-secondary-200 mx-auto mb-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Left Images */}
            <div className="grid grid-cols-2 gap-4">
              <img src={pexelsPixabay} alt="You are not alone" className="rounded-lg object-cover w-full h-40" />
              <img src={pexelsShvetsa} alt="Therapy session" className="rounded-lg object-cover w-full h-40" />
              <img src={pexelsBrettSayles} alt="Sad person" className="rounded-lg object-cover w-full h-40" />
              <img src={pexelsFotiosPhotos} alt="Supportive hand" className="rounded-lg object-cover w-full h-40" />
            </div>
            {/* Center Instagram Info */}
            <div className="flex flex-col items-center justify-center">
              <p className="mb-4 text-secondary-700">Connect with us on Instagram to see our services</p>
              <img src={instagramLogo} alt="Instagram" className="w-12 h-12 mb-2" />
              <div className="font-bold text-lg">@mind.connect</div>
            </div>
            {/* Right Images */}
            <div className="grid grid-cols-2 gap-4">
              <img src={pexelsVieStudio} alt="#BeKind" className="rounded-lg object-cover w-full h-40" />
              <img src={pexelsDanielReche} alt="Pills" className="rounded-lg object-cover w-full h-40" />
              <img src={pexelsEmmaBauso} alt="Mental health" className="rounded-lg object-cover w-full h-40" />
              <img src={pexelsCottonbro} alt="Holding hands" className="rounded-lg object-cover w-full h-40" />
            </div>
          </div>
        </div>
      </section>
      <PopupModal isOpen={showPopup} onClose={() => setShowPopup(false)} />
    </div>
  );
};

export default LandingPage; 