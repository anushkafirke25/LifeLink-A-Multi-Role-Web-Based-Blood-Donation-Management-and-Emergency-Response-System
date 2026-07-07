import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, MapPin, Calendar, LogOut, User, AlertCircle, Droplets, Heart, FileText } from 'lucide-react';
import { donorAPI, authAPI } from '../../services/api';
import { getUser, clearUser, setUser as setStoredUser } from '../../utils/auth';
import EventsList from '../Events/EventsList';
import LanguageSwitcher from '../LanguageSwitcher';
import { eventAPI } from '../../services/eventAPI';
import { generateCertificate } from '../../utils/certificate';

const DonorDashboard = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [donationHistory, setDonationHistory] = useState([]);
  const [campaignNotifications, setCampaignNotifications] = useState([]);
  const [bloodBankNotifications, setBloodBankNotifications] = useState([]);
  const [eligibilityDays, setEligibilityDays] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotification, setShowNotification] = useState(false);
  const [showBloodBankNotification, setShowBloodBankNotification] = useState(false);
  const [showRespondForm, setShowRespondForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseForm, setResponseForm] = useState({
    availableDate: '',
    availableTime: '',
    message: ''
  });
  const [nearbyBloodBanks, setNearbyBloodBanks] = useState([]);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyMessage, setNearbyMessage] = useState('');
  const [useMyLocationCoords, setUseMyLocationCoords] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    bloodType: '',
    address: { street: '', area: '', city: '', state: '', pincode: '' }
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    loadDashboardData();

    // Auto-refresh every 60 seconds for real-time synchronization
    const refreshInterval = setInterval(() => {
      loadDashboardData();
    }, 60000);

    return () => clearInterval(refreshInterval);
  }, [navigate]);

  // Load nearby facilities when nearby tab is active
  useEffect(() => {
    if (activeTab === 'nearby') {
      loadNearbyFacilities();
    }
  }, [activeTab]);

  const loadNearbyFacilities = async (coords = null) => {
    try {
      setNearbyLoading(true);
      setNearbyMessage('');
      setLocationError('');
      const params = coords && typeof coords.lat === 'number' && typeof coords.lng === 'number'
        ? { lat: coords.lat, lng: coords.lng } : undefined;
      const [bloodBanksRes, hospitalsRes] = await Promise.all([
        donorAPI.getNearbyBloodBanks(params).catch((e) => ({ data: { bloodBanks: [], message: e.response?.data?.message } })),
        donorAPI.getNearbyHospitals(params).catch((e) => ({ data: { hospitals: [], message: e.response?.data?.message } }))
      ]);
      const msg = bloodBanksRes.data?.message || hospitalsRes.data?.message;
      if (msg && (msg.includes('log out') || msg.includes('Donor not found') || msg.includes('session'))) {
        setNearbyMessage(msg);
      }
      setNearbyBloodBanks(bloodBanksRes.data?.bloodBanks ?? []);
      setNearbyHospitals(hospitalsRes.data?.hospitals ?? []);
    } catch (err) {
      console.error('Failed to load nearby facilities', err);
      setNearbyMessage(err.response?.data?.message || 'Failed to load nearby facilities.');
    } finally {
      setNearbyLoading(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLocationError('');
    setNearbyLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUseMyLocationCoords({ lat: latitude, lng: longitude });
        loadNearbyFacilities({ lat: latitude, lng: longitude });
      },
      (err) => {
        setNearbyLoading(false);
        setLocationError(t('donor.nearby.locationDenied'));
      }
    );
  };

  const loadDashboardData = async () => {
    try {
      // Only show loading screen on initial load, not on auto-refresh
      if (isInitialLoad) {
        setLoading(true);
      }
      const [requestsRes, historyRes, eventsRes, notificationsRes] = await Promise.all([
        donorAPI.getEmergencyRequests().catch(() => ({ data: { requests: [] } })),
        donorAPI.getDonationHistory().catch(() => ({ data: { history: [] } })),
        eventAPI.getAllEvents('upcoming').catch(() => ({ data: [] })),
        donorAPI.getNotifications().catch(() => ({ data: { notifications: [] } }))
      ]);
      
      setEmergencyRequests(requestsRes.data.requests || []);
      setDonationHistory(historyRes.data.history || []);
      
      // Set campaign notifications
      const events = eventsRes.data || [];
      if (events.length > 0) {
        setCampaignNotifications(events);
        setShowNotification(true);
      }

      // Set blood bank notifications (unread only)
      const notifications = notificationsRes.data.notifications || [];
      const unreadNotifications = notifications.filter(n => !n.isRead);
      if (unreadNotifications.length > 0) {
        setBloodBankNotifications(unreadNotifications);
        setShowBloodBankNotification(true);
      }
      
      // Calculate eligibility - check for scheduled next donation first
      const allDonations = historyRes.data.history || [];
      const scheduledDonations = allDonations.filter(d => d.status === 'scheduled' && d.donationDate);
      const completedDonations = allDonations.filter(d => d.status === 'completed');
      
      // If there's a scheduled donation, use that date
      if (scheduledDonations.length > 0) {
        const nextScheduled = scheduledDonations.sort((a, b) => 
          new Date(a.donationDate) - new Date(b.donationDate)
        )[0];
        const nextDonationDate = new Date(nextScheduled.donationDate);
        const today = new Date();
        const daysUntilScheduled = Math.ceil((nextDonationDate - today) / (1000 * 60 * 60 * 24));
        setEligibilityDays(Math.max(0, daysUntilScheduled));
      } else if (completedDonations.length > 0) {
        // Use last completed donation + 90 days
        const lastDonation = completedDonations.sort((a, b) => 
          new Date(b.donationDate) - new Date(a.donationDate)
        )[0];
        const lastDonationDate = new Date(lastDonation.donationDate);
        const daysSinceDonation = Math.floor((new Date() - lastDonationDate) / (1000 * 60 * 60 * 24));
        const daysUntilEligible = Math.max(0, 90 - daysSinceDonation); // 90 days between donations
        setEligibilityDays(daysUntilEligible);
      } else {
        setEligibilityDays(0); // Eligible if never donated
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
        setIsInitialLoad(false);
      }
    }
  };

  const handleLogout = () => {
    clearUser();
    navigate('/login');
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await authAPI.updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        bloodType: profileForm.bloodType,
        address: profileForm.address
      });
      const updatedUser = res.data?.user;
      if (updatedUser) {
        const normalized = {
          ...updatedUser,
          id: updatedUser._id?.toString?.() || updatedUser.id
        };
        setStoredUser(normalized);
        setUser(normalized);
      }
      setShowProfileModal(false);
      alert(t('donor.profile.updated'));
      if (activeTab === 'nearby') loadNearbyFacilities();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-lg font-medium text-primary-700 animate-pulse-soft">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header: title left, language + profile + logout top right */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-nowrap justify-between items-start gap-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight shrink min-w-0">
              {t('dashboard.welcome')}, <span className="text-primary-600">{user?.name || t('auth.role.donor')}</span>!
            </h1>
            <div className="flex items-center gap-2 shrink-0 flex-shrink-0">
              <LanguageSwitcher />
              <button
                onClick={() => {
                  setProfileForm({
                    name: user?.name || '',
                    phone: user?.phone || '',
                    bloodType: user?.bloodType || '',
                    address: {
                      street: user?.address?.street || '',
                      area: user?.address?.area || '',
                      city: user?.address?.city || '',
                      state: user?.address?.state || '',
                      pincode: user?.address?.pincode || ''
                    }
                  });
                  setShowProfileModal(true);
                }}
                className="btn-secondary-dash"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">{t('donor.profile.updateButton')}</span>
              </button>
              <button onClick={handleLogout} className="btn-primary-dash">
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">{t('nav.logout')}</span>
              </button>
            </div>
          </div>
          <p className="text-gray-600 mt-2 max-w-xl">{t('home.donor.desc')}</p>
          {emergencyRequests.length > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm font-semibold shadow-sm animate-pulse-soft">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              {emergencyRequests.length} {t('donor.emergency.needHelp')}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="dashboard-card mb-8 p-2 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`tab-pill ${activeTab === 'overview' ? 'tab-pill-active' : 'tab-pill-inactive'}`}
          >
            <LayoutDashboard className="w-5 h-5 inline-block mr-2 -mt-0.5" />
            {t('donor.title')}
          </button>
          <button
            onClick={() => setActiveTab('nearby')}
            className={`tab-pill ${activeTab === 'nearby' ? 'tab-pill-active' : 'tab-pill-inactive'}`}
          >
            <MapPin className="w-5 h-5 inline-block mr-2 -mt-0.5" />
            {t('donor.nearby.tab')}
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`tab-pill ${activeTab === 'events' ? 'tab-pill-active' : 'tab-pill-inactive'}`}
          >
            <Calendar className="w-5 h-5 inline-block mr-2 -mt-0.5" />
            {t('events.title')}
          </button>
        </div>

      {/* Nearby Tab */}
      {activeTab === 'nearby' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={nearbyLoading}
              className="btn-primary-dash disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              <MapPin className="w-5 h-5" />
              {t('donor.nearby.useMyLocation')}
            </button>
            {useMyLocationCoords && (
              <span className="text-sm text-gray-600">
                {t('donor.nearby.locationHint')}
              </span>
            )}
          </div>
          {locationError && (
            <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-lg text-red-700 text-sm">
              {locationError}
            </div>
          )}
          {nearbyMessage && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg">
              <p className="text-amber-800">
                ⚠️ {nearbyMessage}
              </p>
              <button
                onClick={handleLogout}
                className="mt-2 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700"
              >
                {t('nav.logout')}{' & '}{t('nav.login')}
              </button>
            </div>
          )}
          {!nearbyMessage && !user?.address?.pincode && !useMyLocationCoords && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <p className="text-yellow-700">
                ⚠️ {t('donor.nearby.addressRequired')}
              </p>
            </div>
          )}

          {nearbyLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-600">{t('donor.nearby.loading')}</div>
            </div>
          ) : (
            <>
              {/* Nearby Blood Banks */}
              <div className="animate-fade-in-up stagger-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Droplets className="w-7 h-7 text-primary-500" />
                  {t('donor.nearby.bloodBanks')}
                </h2>
                {nearbyBloodBanks.length === 0 ? (
                  <div className="dashboard-card p-10 text-center text-gray-500">
                    {t('donor.nearby.noBloodBanks')}
                  </div>
                ) : (
                  <div className="dashboard-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full table-dashboard">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              {t('donor.nearby.name')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              {t('donor.nearby.address')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              {t('donor.nearby.distance')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              {t('donor.nearby.contact')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              {t('donor.nearby.inventory')}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {nearbyBloodBanks.map((bank, idx) => (
                            <tr key={bank._id || idx}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {bank.name}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {bank.address ? (
                                  <div>
                                    {bank.address.street && <div>{bank.address.street}</div>}
                                    {bank.address.area && <div>{bank.address.area}</div>}
                                    <div>
                                      {bank.address.city}, {bank.address.state} - {bank.address.pincode}
                                    </div>
                                  </div>
                                ) : (
                                  bank.location || t('common.na')
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {bank.distance !== null && bank.distance !== undefined && !isNaN(bank.distance) ? (
                                  <span className="badge-info">
                                    <MapPin className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                                    {bank.distance.toFixed(1)} km
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400">{t('common.na')}</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                <div>{bank.phone || t('common.na')}</div>
                                {bank.email && <div className="text-xs text-gray-500">{bank.email}</div>}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {bank.inventory && bank.inventory.length > 0 ? (
                                  <div className="space-y-1">
                                    {bank.inventory.map((inv, i) => (
                                      <div key={i} className="flex items-center gap-2">
                                        <span className="badge-primary">{inv.bloodType}</span>
                                        <span className="text-xs text-gray-600">{inv.units} units</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400">{t('donor.nearby.noInventory')}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Nearby Hospitals */}
              <div className="animate-fade-in-up stagger-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Heart className="w-7 h-7 text-primary-500" />
                  {t('donor.nearby.hospitals')}
                </h2>
                {nearbyHospitals.length === 0 ? (
                  <div className="dashboard-card p-10 text-center text-gray-500">
                    {t('donor.nearby.noHospitals')}
                  </div>
                ) : (
                  <div className="dashboard-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full table-dashboard">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('donor.nearby.name')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('donor.nearby.address')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('donor.nearby.distance')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('donor.nearby.contact')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('donor.nearby.pendingRequests')}</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {nearbyHospitals.map((hospital, idx) => (
                            <tr key={hospital._id || idx}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {hospital.name}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {hospital.address ? (
                                  <div>
                                    {hospital.address.street && <div>{hospital.address.street}</div>}
                                    {hospital.address.area && <div>{hospital.address.area}</div>}
                                    <div>{hospital.address.city}, {hospital.address.state} - {hospital.address.pincode}</div>
                                  </div>
                                ) : (
                                  hospital.location || t('common.na')
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {hospital.distance !== null && hospital.distance !== undefined && !isNaN(hospital.distance) ? (
                                  <span className="badge-info">
                                    <MapPin className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                                    {hospital.distance.toFixed(1)} km
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400">{t('common.na')}</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                <div>{hospital.phone || t('common.na')}</div>
                                {hospital.email && <div className="text-xs text-gray-500">{hospital.email}</div>}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {hospital.pendingRequests > 0 ? (
                                  <span className="badge-rose">{hospital.pendingRequests} {t('donor.nearby.requests')}</span>
                                ) : (
                                  <span className="text-xs text-gray-400">{t('donor.nearby.noPendingRequests')}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && <EventsList />}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
      {/* Blood Bank Notifications */}
      {showBloodBankNotification && bloodBankNotifications.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4 relative">
          <button
            onClick={async () => {
              // Mark all as read
              for (const notif of bloodBankNotifications) {
                try {
                  await donorAPI.markNotificationRead(notif._id);
                } catch (err) {
                  console.error('Failed to mark notification as read:', err);
                }
              }
              setShowBloodBankNotification(false);
              loadDashboardData();
            }}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
          <div className="flex items-start gap-3">
            <div className="text-3xl">🏥</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2">{t('donor.messages.fromBloodBank')}</h3>
              {bloodBankNotifications.map((notif, idx) => (
                <div key={notif._id || idx} className="mb-2 last:mb-0 p-3 bg-white rounded border border-blue-200">
                  <p className="text-sm text-gray-700">{notif.message}</p>
                  {notif.appointmentDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Appointment: {new Date(notif.appointmentDate).toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    From: {notif.bloodBank?.name || t('donor.messages.bloodBankFallback')} • {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Campaign Notifications */}
      {showNotification && campaignNotifications.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg p-4 relative">
          <button
            onClick={() => setShowNotification(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
          <div className="flex items-start gap-3">
            <div className="text-3xl">📢</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">{t('events.title')} Available!</h3>
              <p className="text-sm text-gray-700 mb-2">
                {campaignNotifications.length} {t('donor.messages.campaignsAvailable')}
              </p>
              <button
                onClick={() => setActiveTab('events')}
                className="text-sm text-red-600 font-semibold hover:underline"
              >
                {t('donor.messages.viewCampaigns')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Eligibility Countdown */}
      {eligibilityDays !== null && (
        <div className={`mb-6 rounded-lg p-4 $      ${eligibilityDays === 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
          <div className="flex items-center gap-3">
            <div className="text-2xl">{eligibilityDays === 0 ? '✅' : '⏳'}</div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {eligibilityDays === 0 
                  ? t('donor.eligibility.eligible')
                  : t('donor.eligibility.daysUntil', { count: eligibilityDays })
                }
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {eligibilityDays === 0 
                  ? t('donor.eligibility.scheduleNow')
                  : t('donor.eligibility.minDays')
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card animate-fade-in-up opacity-0 stagger-1 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center">
            <Droplets className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{t('donor.stats.totalDonations')}</h3>
            <p className="text-3xl font-bold text-primary-600 mt-0.5">{donationHistory.filter(d => d.status === 'completed').length}</p>
          </div>
        </div>
        <div className="stat-card animate-fade-in-up opacity-0 stagger-2 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center">
            <Heart className="w-8 h-8 text-rose-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{t('auth.bloodType')}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-0.5">{user?.bloodType || t('common.na')}</p>
          </div>
        </div>
        <div className="stat-card animate-fade-in-up opacity-0 stagger-3 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <Heart className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{t('donor.stats.livesSaved')}</h3>
            <p className="text-3xl font-bold text-emerald-600 mt-0.5">{donationHistory.filter(d => d.status === 'completed').length}</p>
          </div>
        </div>
      </div>

      {/* Emergency Requests */}
      <div className="mb-8 animate-fade-in-up opacity-0 stagger-3">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-7 h-7 text-rose-500" />
          {t('donor.emergency.title')}
        </h2>
        {user?.bloodType && (
          <p className="text-sm text-gray-600 mb-4">
            {t('donor.emergency.showingBloodType')} <span className="font-semibold">{user.bloodType}</span>
          </p>
        )}
        <div className="dashboard-card overflow-hidden">
          {emergencyRequests.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              {user?.bloodType 
                ? t('donor.emergency.noRequests', { type: user.bloodType })
                : t('dashboard.noData')
              }
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {emergencyRequests.map((request, index) => (
                <div key={request._id || index} className="p-6 hover:bg-primary-50/30 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {request.hospital?.name || t('donor.emergency.hospital')}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {t('donor.emergency.bloodType')}: <span className="font-semibold">{request.bloodType}</span> • 
                        {t('donor.emergency.units')}: <span className="font-semibold">{request.units}</span> •
                        {t('donor.emergency.priority')}: <span className={`font-semibold ${
                          request.priority === 'critical' ? 'text-red-600' : 'text-orange-600'
                        }`}>{request.priority === 'critical' ? t('priority.critical') : request.priority === 'urgent' ? t('priority.urgent') : request.priority}</span>
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {t('donor.emergency.locationLabel')} {request.hospital?.location || request.location || t('common.na')}
                      </p>
                      {request.hasResponded && (
                        <p className="text-sm text-green-600 mt-2 font-medium">
                          ✓ {t('donor.emergency.alreadyResponded')}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        if (request.hasResponded) {
                          alert(t('donor.respond.alreadyRespondedAlert'));
                          return;
                        }
                        setSelectedRequest(request);
                        setShowRespondForm(true);
                        setResponseForm({
                          availableDate: '',
                          availableTime: '',
                          message: ''
                        });
                      }}
                      disabled={request.hasResponded}
                      className={request.hasResponded ? 'px-4 py-2 rounded-xl font-medium bg-gray-200 text-gray-500 cursor-not-allowed' : 'btn-primary-dash'}
                    >
                      {request.hasResponded ? t('donor.respond.responded') : t('donor.emergency.respond')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Respond Form Modal */}
      {showRespondForm && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scale-in">
            <h3 className="text-xl font-semibold mb-4">{t('donor.respond.title')}</h3>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>{t('donor.respond.hospital')}:</strong> {selectedRequest.hospital?.name || t('donor.respond.unknownHospital')}
              </p>
              <p className="text-sm text-gray-600">
                <strong>{t('donor.respond.bloodTypeLabel')}:</strong> {selectedRequest.bloodType} • <strong>{t('donor.respond.unitsLabel')}:</strong> {selectedRequest.units}
              </p>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!responseForm.availableDate || !responseForm.availableTime) {
                alert(t('donor.respond.fillRequired'));
                return;
              }
              try {
                await donorAPI.respondToRequest(selectedRequest._id, responseForm);
                alert(t('donor.respond.successMessage'));
                setShowRespondForm(false);
                setSelectedRequest(null);
                setResponseForm({ availableDate: '', availableTime: '', message: '' });
                loadDashboardData();
              } catch (err) {
                alert('Failed to submit response: ' + (err.response?.data?.message || 'Error'));
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('donor.respond.availableDate')}
                </label>
                <input
                  type="date"
                  value={responseForm.availableDate}
                  onChange={(e) => setResponseForm({ ...responseForm, availableDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('donor.respond.availableTime')}
                </label>
                <input
                  type="time"
                  value={responseForm.availableTime}
                  onChange={(e) => setResponseForm({ ...responseForm, availableTime: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('donor.respond.messageOptional')}
                </label>
                <textarea
                  value={responseForm.message}
                  onChange={(e) => setResponseForm({ ...responseForm, message: e.target.value })}
                  rows="3"
                  placeholder={t('donor.respond.placeholderMessage')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRespondForm(false);
                    setSelectedRequest(null);
                    setResponseForm({ availableDate: '', availableTime: '', message: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  {t('donor.respond.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                >
                  {t('donor.respond.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Donation History */}
      <div className="animate-fade-in-up opacity-0 stagger-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-7 h-7 text-primary-500" />
          {t('donor.history.title')}
        </h2>
        <div className="dashboard-card overflow-hidden">
          {donationHistory.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              {t('dashboard.noData')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-dashboard">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('donor.history.date')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('donor.history.bloodBank')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('auth.bloodType')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('donor.history.status')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('donor.history.certificate')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {donationHistory.map((donation, index) => (
                    <tr key={donation._id || index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(donation.donationDate).toLocaleDateString()}
                        {donation.nextDonationDate && donation.status === 'completed' && (
                          <div className="text-xs text-blue-600 mt-1">
                            {t('donor.emergency.nextDonation')} {new Date(donation.nextDonationDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {donation.bloodBank?.name || t('common.na')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {donation.bloodType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`${
                          donation.status === 'completed' ? 'badge-success' : 
                          donation.status === 'scheduled' ? 'badge-info' : 
                          'badge-warning'
                        }`}>
                          {donation.status === 'completed' ? t('donor.history.completed') : 
                           donation.status === 'scheduled' ? t('donor.history.scheduled') : 
                           donation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {donation.status === 'completed' && (
                          <button
                            onClick={() => generateCertificate(donation, user)}
                            className="btn-primary-dash text-sm py-2"
                            title={t('donor.certificate')}
                          >
                            <FileText className="w-4 h-4" />
                            {t('donor.history.certificate')}
                          </button>
                        )}
                        {donation.status === 'scheduled' && (
                          <span className="text-xs text-blue-600">
                            {t('donor.history.scheduledLabel')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
        </>
      )}

      {/* Update Profile Modal (visible on all tabs) */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
            <h3 className="text-xl font-semibold mb-4">{t('donor.profile.title')}</h3>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('donor.profile.name')}
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('donor.profile.phone')}
                </label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('donor.profile.bloodType')}
                </label>
                <select
                  value={profileForm.bloodType}
                  onChange={(e) => setProfileForm({ ...profileForm, bloodType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
                >
                  <option value="">{t('events.selectBloodType')}</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bt) => (
                    <option key={bt} value={bt}>
                      {bt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  {t('donor.profile.address')}
                </h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder={t('donor.profile.street')}
                    value={profileForm.address?.street || ''}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        address: { ...profileForm.address, street: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
                  />
                  <input
                    type="text"
                    placeholder={t('donor.profile.area')}
                    value={profileForm.address?.area || ''}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        address: { ...profileForm.address, area: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder={t('donor.profile.city')}
                      value={profileForm.address?.city || ''}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          address: { ...profileForm.address, city: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
                    />
                    <input
                      type="text"
                      placeholder={t('donor.profile.state')}
                      value={profileForm.address?.state || ''}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          address: { ...profileForm.address, state: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder={t('donor.profile.pincode')}
                    value={profileForm.address?.pincode || ''}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        address: { ...profileForm.address, pincode: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
                    maxLength="6"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="btn-secondary-dash"
                >
                  {t('dashboard.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="btn-primary-dash disabled:opacity-50 disabled:transform-none"
                >
                  {profileSaving ? '...' : t('donor.profile.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default DonorDashboard;
