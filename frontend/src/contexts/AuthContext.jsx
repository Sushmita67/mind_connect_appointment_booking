import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpData, setOtpData] = useState(null);

  // Check for existing user session on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      validateSession(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateSession = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate-session`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Session validation error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data.user;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const signup = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data.user;
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const requestPasswordReset = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store OTP data for verification
        setOtpData({
          email,
          otp: data.otp, // In production, this wouldn't be sent back
          expiry: data.expiry,
          attempts: 0
        });
        return { message: 'OTP sent successfully' };
      } else {
        throw new Error(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      throw new Error(error.message || 'Failed to send OTP');
    }
  };

  const verifyOTP = async (email, otp) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!otpData || otpData.email !== email) {
          reject(new Error('Invalid OTP request'));
          return;
        }
        
        if (otpData.attempts >= 3) {
          reject(new Error('Too many attempts. Please request a new OTP.'));
          return;
        }
        
        if (new Date() > otpData.expiry) {
          reject(new Error('OTP has expired. Please request a new one.'));
          return;
        }
        
        if (otpData.otp !== otp) {
          setOtpData(prev => ({ ...prev, attempts: prev.attempts + 1 }));
          reject(new Error('Invalid OTP'));
          return;
        }
        
        resolve({ message: 'OTP verified successfully' });
      }, 500);
    });
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setOtpData(null);
        return { message: 'Password reset successfully' };
      } else {
        throw new Error(data.message || 'Password reset failed');
      }
    } catch (error) {
      throw new Error(error.message || 'Password reset failed');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const updatedUser = { ...user, ...data.data };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      } else {
        throw new Error(data.message || 'Profile update failed');
      }
    } catch (error) {
      throw new Error(error.message || 'Profile update failed');
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    if (!user) throw new Error('Not authenticated');
    // Verify old password by logging in
    await login(user.email, oldPassword);
    // Update password
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users/${user._id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: newPassword }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Password change failed');
    }
    return { message: 'Password changed successfully' };
  };

  const getUserAppointments = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/appointments/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch appointments');
    }
    return data.data;
  };

  const value = {
    user,
    login,
    signup,
    logout,
    requestPasswordReset,
    verifyOTP,
    resetPassword,
    updateProfile,
    changePassword,
    getUserAppointments,
    loading,
    otpData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 