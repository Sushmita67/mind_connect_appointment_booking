import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Settings, 
  CreditCard, 
  Shield, 
  Bell, 
  FileText,
  ChevronRight,
  Edit,
  Save,
  X
} from 'lucide-react';

const AccountRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<AccountDashboard />} />
      <Route path="/profile" element={<ProfileSettings />} />
      <Route path="/billing" element={<BillingSettings />} />
      <Route path="/security" element={<SecuritySettings />} />
      <Route path="/notifications" element={<NotificationSettings />} />
    </Routes>
  );
};

const AccountDashboard = () => {
  const { user, getUserAppointments } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getUserAppointments();
        setAppointments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [getUserAppointments]);

  // Calculate totals
  const now = new Date();
  const totalSessions = appointments.length;
  const upcoming = appointments.filter(a => {
    const date = new Date(a.date);
    return date > now && a.status !== 'cancelled' && a.status !== 'completed';
  }).length;
  const totalSpent = appointments
    .filter(a => a.paymentStatus === 'paid')
    .reduce((sum, a) => sum + (a.price || 0), 0);

  const location = useLocation();

  const menuItems = [
    {
      name: 'Profile',
      path: '/account/profile',
      icon: User,
      description: 'Manage your personal information'
    },
    {
      name: 'Billing & Payments',
      path: '/account/billing',
      icon: CreditCard,
      description: 'View invoices and payment methods'
    },
    {
      name: 'Security',
      path: '/account/security',
      icon: Shield,
      description: 'Password and account security'
    },
    {
      name: 'Notifications',
      path: '/account/notifications',
      icon: Bell,
      description: 'Email and app notifications'
    }
  ];

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Account Settings</h1>
          <p className="text-secondary-600">
            Manage your account preferences and settings
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link
                  to={item.path}
                  className="block bg-white rounded-xl shadow-sm border border-secondary-200 p-6 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                        <Icon size={24} className="text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-sm text-secondary-600">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-secondary-400 group-hover:text-primary-600 transition-colors" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white rounded-xl shadow-sm border border-secondary-200 p-6"
        >
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Account Overview</h3>
          {loading ? (
            <div className="text-center text-secondary-500">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">{totalSessions}</p>
                <p className="text-sm text-secondary-600">Total Sessions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{upcoming}</p>
                <p className="text-sm text-secondary-600">Upcoming</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">Rs. {totalSpent.toFixed(2)}</p>
                <p className="text-sm text-secondary-600">Total Spent</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const ProfileSettings = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    address: user?.address || ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(form);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6"
        >
          <button
            onClick={() => navigate('/account')}
            className="mb-4 ml-1 p-0 bg-transparent border-none outline-none hover:text-primary-700 text-primary-500 transition-colors"
            aria-label="Back"
            style={{ lineHeight: 0 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-secondary-900">Profile Settings</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-secondary-300 text-secondary-700 hover:bg-secondary-50 transition-colors"
            >
              {isEditing ? <X size={16} /> : <Edit size={16} />}
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                disabled={!isEditing}
                className="input-field disabled:bg-secondary-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
                disabled={!isEditing}
                className="input-field disabled:bg-secondary-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({...form, phone: e.target.value})}
                disabled={!isEditing}
                className="input-field disabled:bg-secondary-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm({...form, dateOfBirth: e.target.value})}
                disabled={!isEditing}
                className="input-field disabled:bg-secondary-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Address
              </label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({...form, address: e.target.value})}
                disabled={!isEditing}
                rows={3}
                className="input-field disabled:bg-secondary-50"
              />
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const BillingSettings = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-secondary-200 p-8"
        >
          <button
            onClick={() => navigate('/account')}
            className="mb-4 ml-1 p-0 bg-transparent border-none outline-none hover:text-primary-700 text-primary-500 transition-colors"
            aria-label="Back"
            style={{ lineHeight: 0 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-secondary-900 mb-8">Billing & Payments</h1>
          <div className="mb-10">
            <h3 className="text-xl font-semibold mb-3 text-primary-700">Payment Methods</h3>
            <ul className="space-y-2 bg-secondary-50 rounded-lg p-4 border border-secondary-100">
              <li className="flex items-center justify-between">
                <span>Visa ending in 1234</span>
                <span className="text-secondary-500 text-sm">Exp: 12/26</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Mastercard ending in 5678</span>
                <span className="text-secondary-500 text-sm">Exp: 09/25</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3 text-primary-700">Recent Invoices</h3>
            <ul className="divide-y divide-accent-100 bg-secondary-50 rounded-lg border border-secondary-100">
              <li className="flex justify-between items-center px-4 py-3">
                <span>Invoice #1001</span>
                <span className="text-green-600 font-medium">Rs. 1199.00</span>
                <span className="text-secondary-500 text-sm">Paid</span>
              </li>
              <li className="flex justify-between items-center px-4 py-3">
                <span>Invoice #1002</span>
                <span className="text-green-600 font-medium">Rs. 899.00</span>
                <span className="text-secondary-500 text-sm">Paid</span>
              </li>
              <li className="flex justify-between items-center px-4 py-3">
                <span>Invoice #1003</span>
                <span className="text-blue-600 font-medium">Rs. 1000.00</span>
                <span className="text-accent-600 text-sm">Pending</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const SecuritySettings = () => {
  const navigate = useNavigate();
  const { changePassword } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (oldPassword === newPassword) {
      setError("Old password and new password must not be the same.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirm new password must be the same.");
      return;
    }
    setLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      setSuccess("Password changed successfully!");
      setShowForm(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-secondary-200 p-8"
        >
          <button
            onClick={() => navigate('/account')}
            className="mb-4 ml-1 p-0 bg-transparent border-none outline-none hover:text-primary-700 text-primary-500 transition-colors"
            aria-label="Back"
            style={{ lineHeight: 0 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-secondary-900 mb-8">Security Settings</h1>
          <div className="mb-10">
            <h3 className="text-xl font-semibold mb-3 text-primary-700">Password</h3>
            <div className="flex flex-col gap-3 bg-secondary-50 rounded-lg p-4 border border-secondary-100">
              <span className="text-secondary-700">Last changed: <span className="font-medium">2 months ago</span></span>
              {!showForm && (
                <button
                  className="px-4 py-1 rounded bg-primary-100 text-primary-700 font-medium hover:bg-primary-200 transition w-max"
                  onClick={() => setShowForm(true)}
                >
                  Change Password
                </button>
              )}
              {showForm && (
                <form onSubmit={handleChangePassword} className="flex flex-col gap-3 mt-2">
                  <input
                    type="password"
                    placeholder="Old Password"
                    className="input-field"
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    className="input-field"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    className="input-field"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                  {error && <div className="text-red-600 text-sm">{error}</div>}
                  {success && <div className="text-green-600 text-sm">{success}</div>}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="btn-primary flex-1"
                      disabled={loading}
                    >
                      {loading ? 'Changing...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary flex-1"
                      onClick={() => { setShowForm(false); setError(""); setSuccess(""); }}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3 text-primary-700">Two-Factor Authentication</h3>
            <div className="flex items-center justify-between bg-secondary-50 rounded-lg p-4 border border-secondary-100">
              <span className="text-secondary-700">Status: <span className="text-green-600 font-semibold">Enabled</span></span>
              <button className="px-4 py-1 rounded bg-accent-100 text-accent-800 font-medium hover:bg-accent-200 transition">Manage 2FA</button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const NotificationSettings = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-secondary-200 p-8"
        >
          <button
            onClick={() => navigate('/account')}
            className="mb-4 ml-1 p-0 bg-transparent border-none outline-none hover:text-primary-700 text-primary-500 transition-colors"
            aria-label="Back"
            style={{ lineHeight: 0 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-secondary-900 mb-8">Notification Settings</h1>
          <div className="mb-10">
            <h3 className="text-xl font-semibold mb-3 text-primary-700">Email Notifications</h3>
            <ul className="space-y-2 bg-secondary-50 rounded-lg p-4 border border-secondary-100">
              <li className="flex items-center justify-between">
                <span>Session reminders</span>
                <span className="text-green-600 font-medium">Enabled</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Promotional emails</span>
                <span className="text-secondary-400 font-medium">Disabled</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Payment receipts</span>
                <span className="text-green-600 font-medium">Enabled</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3 text-primary-700">App Notifications</h3>
            <ul className="space-y-2 bg-secondary-50 rounded-lg p-4 border border-secondary-100">
              <li className="flex items-center justify-between">
                <span>Session updates</span>
                <span className="text-green-600 font-medium">Enabled</span>
              </li>
              <li className="flex items-center justify-between">
                <span>New therapist messages</span>
                <span className="text-green-600 font-medium">Enabled</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AccountRouter; 