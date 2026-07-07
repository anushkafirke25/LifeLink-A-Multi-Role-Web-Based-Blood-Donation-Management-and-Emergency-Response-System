import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { setUser } from '../../utils/auth';
import LanguageSwitcher from '../LanguageSwitcher';

const Login = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      const userData = response.data.user;
      
      setUser(userData);

      // Redirect based on role
      if (userData.role === 'donor') {
        navigate('/donor');
      } else if (userData.role === 'hospital') {
        navigate('/hospital');
      } else if (userData.role === 'bloodbank') {
        navigate('/bloodbank');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-pink-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-md w-full relative">
        {/* Logo and Language Switcher */}
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">❤️</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
              {t('nav.lifelink')}
            </span>
          </Link>
          <LanguageSwitcher />
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
          <div className="p-8 md:p-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {t('auth.login.title')}
              </h2>
              <p className="text-gray-600">{t('auth.login.subtitle')}</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">📧</span>
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">🔒</span>
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-250 hover:-translate-y-0.5 focus:ring-4 focus:ring-primary-300"
                style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}
              >
                {t('auth.loginButton')} →
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {t('auth.noAccount')}{' '}
                <Link to="/register" className="text-red-600 hover:text-red-700 font-semibold">
                  {t('auth.registerLink')}
                </Link>
              </p>
            </div>
          </div>

          {/* Quick Login Demo Accounts */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-3 text-center font-medium">Demo Accounts:</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <p className="font-semibold text-red-600">Donor</p>
                <p className="text-gray-600 truncate">rahul@donor.com</p>
              </div>
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <p className="font-semibold text-blue-600">Hospital</p>
                <p className="text-gray-600 truncate">general@hospital.com</p>
              </div>
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <p className="font-semibold text-purple-600">Blood Bank</p>
                <p className="text-gray-600 truncate">central@bloodbank.com</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">Password: password123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
