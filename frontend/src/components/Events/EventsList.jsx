import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { eventAPI } from '../../services/eventAPI';

const EventsList = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bloodType: '',
    notes: ''
  });

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventAPI.getAllEvents('upcoming');
      setEvents(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await eventAPI.registerForEvent(selectedEvent._id, formData);
      alert(t('events.registration.success'));
      setShowRegisterForm(false);
      setSelectedEvent(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        bloodType: '',
        notes: ''
      });
      fetchEvents();
    } catch (error) {
      console.error('Error registering for event:', error);
      alert(error.response?.data?.message || 'Failed to register for event');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">{t('events.title')}</h2>
        <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium">
          {events.length} Active Campaigns
        </span>
      </div>

      {/* Events Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div key={event._id} className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            {event.imageUrl ? (
              <img
                src={`http://localhost:5000${event.imageUrl}`}
                alt={event.title}
                className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-56 bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                <span className="text-6xl">🩸</span>
              </div>
            )}
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-900 flex-1">{event.title}</h3>
                {event.registrationCount > 0 && (
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    {event.registrationCount} 👥
                  </span>
                )}
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{event.description}</p>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <span>📅</span>
                  <span className="font-medium">{new Date(event.eventDate).toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🕐</span>
                  <span>{event.eventTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span className="line-clamp-1">{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🏥</span>
                  <span className="line-clamp-1 font-medium text-blue-600">
                    {event.hospital?.name || 'Hospital'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📞</span>
                  <span>{event.contactInfo}</span>
                </div>
              </div>

              {event.requirements && (
                <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <p className="text-xs text-yellow-800">
                    <span className="font-semibold">Requirements:</span> {event.requirements}
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  setSelectedEvent(event);
                  setShowRegisterForm(true);
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold"
              >
                {t('events.register')} →
              </button>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
          <span className="text-6xl mb-4 block">📅</span>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Active Campaigns</h3>
          <p className="text-gray-500">Check back soon for upcoming blood donation drives!</p>
        </div>
      )}

      {/* Registration Modal */}
      {showRegisterForm && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{t('events.registration.title')}</h3>
                  <p className="text-red-100 text-sm">{selectedEvent.title}</p>
                </div>
                <button
                  onClick={() => {
                    setShowRegisterForm(false);
                    setSelectedEvent(null);
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleRegister} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('events.registration.name')} *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('events.registration.email')} *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('events.registration.phone')} *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('events.registration.bloodType')} *
                </label>
                <select
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">{t('events.selectBloodType')}</option>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('events.notesOptional')}
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder={t('events.notesPlaceholder')}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-semibold"
                >
                  {t('events.registration.submit')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRegisterForm(false);
                    setSelectedEvent(null);
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
                >
                  {t('dashboard.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsList;

