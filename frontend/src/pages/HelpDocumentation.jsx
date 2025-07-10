import React, { useState } from 'react';

const topics = [
  {
    id: 'register',
    title: 'How to Register',
    content: (
      <>
        <h2 className="text-xl font-bold mb-2">How to Register</h2>
        <ol className="list-decimal ml-6 space-y-1">
          <li>Go to the <b>Create Account</b> page.</li>
          <li>Fill in your full name, email address, and create a password.</li>
          <li>Confirm your password and click <b>Create account</b>.</li>
          <li>After successful registration, you will be redirected to your profile/account page.</li>
        </ol>
      </>
    )
  },
  {
    id: 'login',
    title: 'How to Login',
    content: (
      <>
        <h2 className="text-xl font-bold mb-2">How to Login</h2>
        <ol className="list-decimal ml-6 space-y-1">
          <li>Go to the <b>Login</b> page.</li>
          <li>Enter your registered email and password.</li>
          <li>Click <b>Sign in</b> to access your account.</li>
          <li>If you forgot your password, use the <b>Forgot your password?</b> link.</li>
        </ol>
      </>
    )
  },
  {
    id: 'password',
    title: 'Resetting Your Password',
    content: (
      <>
        <h2 className="text-xl font-bold mb-2">Resetting Your Password</h2>
        <ol className="list-decimal ml-6 space-y-1">
          <li>On the <b>Login</b> page, click <b>Forgot your password?</b></li>
          <li>Enter your email address and request an OTP.</li>
          <li>Check your email for the OTP and enter it on the site.</li>
          <li>Set a new password and confirm it.</li>
          <li>After resetting, you can log in with your new password.</li>
        </ol>
      </>
    )
  },
  {
    id: 'booking',
    title: 'Booking a Therapy Session',
    content: (
      <>
        <h2 className="text-xl font-bold mb-2">Booking a Therapy Session</h2>
        <ol className="list-decimal ml-6 space-y-1">
          <li>Go to the <b>Book a Session</b> page.</li>
          <li>Select the type of session you want.</li>
          <li>Choose a therapist, date, and time.</li>
          <li>If you are not logged in, provide your contact information.</li>
          <li>Review your booking and confirm.</li>
        </ol>
      </>
    )
  },
  {
    id: 'appointments',
    title: 'Managing Appointments',
    content: (
      <>
        <h2 className="text-xl font-bold mb-2">Managing Appointments</h2>
        <ol className="list-decimal ml-6 space-y-1">
          <li>Go to the <b>My Appointments</b> page after logging in.</li>
          <li>View upcoming and past appointments.</li>
          <li>Reschedule or cancel appointments as needed.</li>
          <li>View session details and download prescriptions if available.</li>
        </ol>
      </>
    )
  },
  {
    id: 'privacy',
    title: 'Privacy & Confidentiality',
    content: (
      <>
        <h2 className="text-xl font-bold mb-2">Privacy & Confidentiality</h2>
        <p>Your personal and session information is kept strictly confidential and secure. Only you and your therapist can access your session details.</p>
      </>
    )
  },
  {
    id: 'contact',
    title: 'Contact & Support',
    content: (
      <>
        <h2 className="text-xl font-bold mb-2">Contact & Support</h2>
        <p>If you need help or have questions, contact us at <a href="mailto:mindconnect2025@gmail.com" ><strong>mindconnect2025@gmail.com</strong></a> <br></br>or call <a href="tel:+977 9812345678"><strong>+977 9812345678 </strong></a>.</p>
      </>
    )
  }
];

const HelpDocumentation = () => {
  const [selected, setSelected] = useState(topics[0].id);

  const currentTopic = topics.find(t => t.id === selected);

  return (
    <div className="min-h-screen bg-secondary-50 py-12">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg flex flex-col md:flex-row">
        {/* Sidebar */}
        <nav className="md:w-1/4 border-r border-secondary-100 p-6">
          <ul className="space-y-4">
            {topics.map(topic => (
              <li key={topic.id}>
                <button
                  className={`w-full text-left font-semibold px-2 py-1 rounded transition ${selected === topic.id ? 'bg-primary-100 text-primary-700' : 'hover:bg-secondary-100'}`}
                  onClick={() => setSelected(topic.id)}
                >
                  {topic.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        {/* Content */}
        <main className="flex-1 p-8">
          {currentTopic && (
            <div className="prose max-w-none">
              {currentTopic.content}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HelpDocumentation; 