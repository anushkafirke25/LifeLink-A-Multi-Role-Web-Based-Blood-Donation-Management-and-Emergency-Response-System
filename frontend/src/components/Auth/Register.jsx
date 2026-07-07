import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { setUser } from '../../utils/auth';
import LanguageSwitcher from '../LanguageSwitcher';

const Register = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'donor',
    bloodType: 'A+',
    location: '',
    address: {
      street: '',
      area: '',
      city: '',
      state: '',
      pincode: ''
    }
  });
  const [signatureDataUrl, setSignatureDataUrl] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = { ...formData };
    if (formData.role === 'bloodbank' && signatureDataUrl) payload.signature = signatureDataUrl;

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', payload);
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
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-pink-50 flex items-center justify-center p-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 -left-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-2xl w-full relative">
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

        {/* Register Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
          <div className="p-8 md:p-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {t('auth.register.title')}
              </h2>
              <p className="text-gray-600">{t('auth.register.subtitle')}</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.name')} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.email')} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.password')} *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.phone')} *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.role')} *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  >
                    <option value="donor">{t('auth.role.donor')}</option>
                    <option value="hospital">{t('auth.role.hospital')}</option>
                    <option value="bloodbank">{t('auth.role.bloodbank')}</option>
                  </select>
                </div>

                {formData.role === 'donor' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('auth.bloodType')} *
                    </label>
                    <select
                      name="bloodType"
                      value={formData.bloodType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                )}

                {formData.role === 'bloodbank' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Authorized signature (optional)
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      This signature will appear on donation certificates when donors receive a certificate from your blood bank. Upload once at registration.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 text-gray-700 font-medium">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => setSignatureDataUrl(reader.result);
                            reader.readAsDataURL(file);
                          }}
                        />
                        Choose image
                      </label>
                      {signatureDataUrl && (
                        <>
                          <div className="border border-gray-200 rounded-lg p-2 bg-gray-50 inline-block">
                            <img src={signatureDataUrl} alt="Signature preview" className="max-h-12 object-contain" />
                          </div>
                          <button
                            type="button"
                            onClick={() => setSignatureDataUrl(null)}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className={formData.role === 'donor' ? '' : 'md:col-span-2'}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.location')} *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="Mumbai, Maharashtra"
                  />
                </div>
              </div>

              {/* Detailed Address Fields */}
              <div className="border-t pt-5 mt-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Address (for distance calculation)</h3>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street / Building
                    </label>
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Area / Locality *
                    </label>
                    <input
                      type="text"
                      value={formData.address.area}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, area: e.target.value } })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="Andheri West"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="Mumbai"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="Maharashtra"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode * (for distance calculation)
                    </label>
                    <input
                      type="text"
                      value={formData.address.pincode}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) } })}
                      required
                      maxLength={6}
                      pattern="[0-9]{6}"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="400053"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter 6-digit pincode for accurate distance calculation</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 text-white rounded-xl font-semibold text-lg mt-6 shadow-lg hover:shadow-xl transition-all duration-250 hover:-translate-y-0.5 focus:ring-4 focus:ring-primary-300"
                style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}
              >
                {t('auth.registerButton')} →
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {t('auth.hasAccount')}{' '}
                <Link to="/login" className="text-red-600 hover:text-red-700 font-semibold">
                  {t('auth.loginLink')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
