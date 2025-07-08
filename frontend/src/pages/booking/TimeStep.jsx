import React, { useState, useEffect } from 'react';
import { useBooking } from '../../contexts/BookingContext';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const TimeStep = ({ goNext, goBack, bookingData, updateBookingData }) => {
  const { getAvailableTimes, fetchTherapistAppointmentsPublic } = useBooking();
  const [localTime, setLocalTime] = useState(bookingData?.time || '');
  const [bookedTimes, setBookedTimes] = useState([]);

  // Get all possible times
  const allTimes = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  // Fetch booked times for therapist and date
  useEffect(() => {
    const fetchBooked = async () => {
      if (bookingData?.therapist?._id && bookingData?.date) {
        const appointments = await fetchTherapistAppointmentsPublic(bookingData.therapist._id, bookingData.date);
        setBookedTimes(appointments.map(apt => apt.time));
      } else {
        setBookedTimes([]);
      }
    };
    fetchBooked();
  }, [bookingData?.therapist?._id, bookingData?.date, fetchTherapistAppointmentsPublic]);

  const availableTimes = allTimes.filter(time => !bookedTimes.includes(time));

  const handleNext = () => {
    updateBookingData('time', localTime);
    goNext();
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex flex-col gap-0 mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-primary-700 tracking-tight mb-2">Confirm Time</h2>
        <div className="bg-secondary-100 rounded-t-xl px-6 py-3 text-left text-secondary-700 font-semibold text-base">Select a Time</div>
        <div className="bg-secondary-50 px-6 py-3 text-sm text-secondary-500 rounded-b-xl border-b border-secondary-200">Choose a time for your appointment on <span className="font-semibold text-primary-600">{bookingData?.date || '[Date Selected]'}</span></div>
      </div>
      <div className="mb-10">
        {allTimes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-secondary-100">
            {allTimes.map((time) => {
              const isAvailable = !bookedTimes.includes(time);
              return (
                <button
                  key={time}
                  className={`w-full py-3 rounded-xl text-lg font-semibold shadow transition-all border focus:outline-none focus:ring-2 focus:ring-primary-300 ${
                    localTime === time && isAvailable
                      ? 'bg-primary-700 text-white border-primary-700 shadow-lg'
                      : isAvailable
                        ? 'bg-secondary-50 text-primary-700 border-secondary-200 hover:bg-primary-50 hover:border-primary-300'
                        : 'bg-secondary-100 text-secondary-400 border-secondary-200 cursor-not-allowed opacity-60'
                  }`}
                  onClick={() => isAvailable && setLocalTime(time)}
                  disabled={!isAvailable}
                >
                  {time}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-4 rounded-xl border border-secondary-100 text-secondary-400 text-center text-base">Not available for <span className="font-semibold">{bookingData?.date || '[Date Selected]'}</span></div>
        )}
      </div>
      <div className="flex justify-between mt-8">
        <button
          className="px-6 py-3 rounded-lg border border-secondary-300 bg-white text-secondary-700 font-semibold shadow hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-secondary-400 flex items-center gap-2 transition-all"
          onClick={goBack}
        >
          <ArrowLeft size={18} /> Back
        </button>
        <button
          className="px-6 py-3 rounded-lg bg-primary-700 text-white font-semibold shadow hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-400 flex items-center gap-2 disabled:opacity-50 transition-all"
          onClick={handleNext}
          disabled={!localTime || bookedTimes.includes(localTime)}
        >
          Confirm Time <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default TimeStep; 