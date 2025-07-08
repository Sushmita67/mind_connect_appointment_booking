import React, { useState } from 'react';
import { useBooking } from '../../contexts/BookingContext';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './DateStepCalendar.css';

function formatDateLocal(date) {
  // Returns YYYY-MM-DD in local time
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DateStep = ({ goNext, goBack, bookingData, updateBookingData }) => {
  const { getAvailableDates } = useBooking();
  const [localDate, setLocalDate] = useState(bookingData?.date || '');

  // Use local time for the calendar value
  const selectedDateObj = localDate
    ? new Date(
        parseInt(localDate.split('-')[0], 10),
        parseInt(localDate.split('-')[1], 10) - 1,
        parseInt(localDate.split('-')[2], 10)
      )
    : undefined;

  // Helper for today at midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Calculate max date (3 months from today)
  const maxDate = new Date(today);
  maxDate.setMonth(maxDate.getMonth() + 3);

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex flex-col gap-0 mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-primary-700 tracking-tight mb-2">Confirm Date</h2>
        <div className="bg-secondary-100 rounded-t-xl px-6 py-3 text-left text-secondary-700 font-semibold text-base">Select a date</div>
        <div className="bg-secondary-50 px-6 py-3 text-sm text-secondary-500 rounded-b-xl border-b border-secondary-200">You can schedule your appointment starting from tomorrow. Today's date is not available for booking.</div>
      </div>
      <div className="flex justify-center mb-10">
        <div className="p-0 bg-transparent border-0">
          <Calendar
            onChange={date => {
              if (date instanceof Date) {
                setLocalDate(formatDateLocal(date));
              }
            }}
            value={selectedDateObj}
            tileClassName={({ date }) => {
              if (date.getDay() === 6 || date <= today || date > maxDate) return 'calendar-disabled';
              return '';
            }}
            tileDisabled={({ date }) => date.getDay() === 6 || date <= today || date > maxDate}
            prev2Label={null}
            next2Label={null}
            calendarType="gregory"
            showNeighboringMonth={false}
            maxDate={maxDate}
          />
        </div>
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
          onClick={() => {
            updateBookingData('date', localDate);
            goNext();
          }}
          disabled={!localDate}
        >
          Confirm Date <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default DateStep; 