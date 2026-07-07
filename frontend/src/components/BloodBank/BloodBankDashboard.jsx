import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Droplets, Users, Calendar, Building2, LogOut, PlusCircle, AlertCircle, User } from 'lucide-react';
import { bloodBankAPI, authAPI } from '../../services/api';
import { getUser, clearUser, setUser as setStoredUser } from '../../utils/auth';
import LanguageSwitcher from '../LanguageSwitcher';
import NotificationModal from '../NotificationModal';
import BloodBankEventManagement from './BloodBankEventManagement';

const BloodBankDashboard = () => {
  const { t } = useTranslation();
  const [inventory, setInventory] = useState([]);
  const [eligibleDonors, setEligibleDonors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [hospitalRequests, setHospitalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showAddInventory, setShowAddInventory] = useState(false);
  const [inventoryForm, setInventoryForm] = useState({ bloodType: 'A+', units: '' });
  const [showRecordDonation, setShowRecordDonation] = useState(false);
  const [donorSearchQuery, setDonorSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [donationForm, setDonationForm] = useState({
    name: '',
    email: '',
    phone: '',
    bloodType: 'A+',
    location: '',
    password: '',
    units: 1,
    notes: ''
  });
  const [showScheduleAppointment, setShowScheduleAppointment] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({ donorId: '', appointmentDate: '', appointmentTime: '' });
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState({ open: false, type: 'info', title: '', message: '', confirmText: 'OK', cancelText: 'Cancel' });
  const [pendingApprove, setPendingApprove] = useState(null); // { requestId, request } when confirm is open
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: { street: '', area: '', city: '', state: '', pincode: '' }
  });
  const [profileSignature, setProfileSignature] = useState(null); // null = no change, '' = remove, dataURL = new
  const [profileSaving, setProfileSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const showNotification = (opts) => {
    setNotification({
      open: true,
      type: opts.type || 'info',
      title: opts.title ?? '',
      message: opts.message ?? '',
      confirmText: opts.confirmText ?? 'OK',
      cancelText: opts.cancelText ?? 'Cancel',
    });
  };
  const closeNotification = () => {
    setNotification((n) => ({ ...n, open: false }));
    setPendingApprove(null);
  };

  const loadDashboardData = useCallback(async () => {
    try {
      // Only show loading screen on initial load, not on auto-refresh
      if (isInitialLoad) {
        setLoading(true);
      }
      const [inventoryRes, eligibleRes, appointmentsRes, requestsRes] = await Promise.all([
        bloodBankAPI.getInventory().catch(() => ({ data: { inventory: [] } })),
        bloodBankAPI.getEligibleDonors().catch(() => ({ data: { eligibleDonors: [] } })),
        bloodBankAPI.getAppointments().catch(() => ({ data: { appointments: [] } })),
        bloodBankAPI.getHospitalRequests().catch(() => ({ data: { requests: [] } }))
      ]);
      
      setInventory(inventoryRes.data.inventory || []);
      setEligibleDonors(eligibleRes.data.eligibleDonors || []);
      setAppointments(appointmentsRes.data.appointments || []);
      // Filter out fulfilled requests on frontend as well (safety measure)
      const allRequests = requestsRes.data.requests || [];
      const activeRequests = allRequests.filter(req => req.status !== 'fulfilled');
      setHospitalRequests(activeRequests);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
        setIsInitialLoad(false);
      }
    }
  }, [isInitialLoad]);

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
  }, [navigate, loadDashboardData]);

  const handleLogout = () => {
    clearUser();
    navigate('/login');
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

  const totalUnits = inventory.reduce((sum, item) => sum + (item.units || 0), 0);

  const handleUpdateInventory = async (e) => {
    e.preventDefault();
    try {
      await bloodBankAPI.updateInventory(inventoryForm.bloodType, { units: parseInt(inventoryForm.units) });
      setShowAddInventory(false);
      setInventoryForm({ bloodType: 'A+', units: '' });
      loadDashboardData(); // Refresh data
      alert(t('message.inventoryUpdated'));
    } catch (err) {
      alert('Failed to update inventory: ' + (err.response?.data?.message || 'Error'));
    }
  };

  const showApproveConfirm = (requestId, request) => {
    setPendingApprove({ requestId, request });
    showNotification({
      type: 'confirm',
      title: 'Confirm Approval',
      message: `Approve this request for ${request.units} units of ${request.bloodType}?`,
      confirmText: 'Approve',
      cancelText: 'Cancel',
    });
  };

  const executeApprove = async (requestId, request, units = request.units) => {
    closeNotification();
    try {
      const response = await bloodBankAPI.processRequest(requestId, {
        status: 'approved',
        units
      });
      if (response.data.remainingUnits > 0) {
        showNotification({
          type: 'success',
          title: 'Partially Fulfilled',
          message: `${response.data.fulfilledUnits} units approved. Remaining: ${response.data.remainingUnits} units still needed.`,
        });
      } else {
        showNotification({
          type: 'success',
          title: 'Request Fulfilled',
          message: 'Request fulfilled successfully!',
        });
      }
      loadDashboardData();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to process request';
      if (errorMsg.includes('Insufficient') || errorMsg.includes('No blood units')) {
        const available = err.response?.data?.available ?? request.availableUnits ?? 0;
        if (available > 0) {
          setPendingApprove({ requestId, request, partialUnits: available });
          showNotification({
            type: 'confirm',
            title: 'Insufficient Inventory',
            message: `Only ${available} units available. Would you like to partially fulfill with ${available} units?`,
            confirmText: 'Yes, Partially Fulfill',
            cancelText: 'Cancel',
          });
          return;
        }
        showNotification({ type: 'error', title: 'Insufficient Inventory', message: errorMsg });
      } else {
        showNotification({ type: 'error', title: 'Error', message: errorMsg });
      }
    }
  };

  const handleProcessRequest = (requestId, request) => {
    showApproveConfirm(requestId, request);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setProfileSaving(true);
      const payload = {
        name: profileForm.name,
        phone: profileForm.phone,
        address: {
          street: profileForm.address?.street || '',
          area: profileForm.address?.area || '',
          city: profileForm.address?.city || '',
          state: profileForm.address?.state || '',
          pincode: profileForm.address?.pincode || ''
        }
      };
      if (profileSignature !== null) payload.signature = profileSignature;
      const resp = await authAPI.updateProfile(payload);
      const updatedUser = resp.data?.user || { ...(getUser() || {}), ...payload };
      const normalized = { ...updatedUser, id: updatedUser.id || updatedUser._id?.toString?.() };
      setStoredUser(normalized);
      setUser(normalized);
      setProfileSignature(null);
      setShowProfileModal(false);
      showNotification({ type: 'success', title: 'Success', message: t('bloodbank.profile.updated') });
    } catch (err) {
      showNotification({ type: 'error', title: 'Error', message: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSearchDonors = async (query) => {
    setDonorSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      const response = await bloodBankAPI.searchDonors(query);
      setSearchResults(response.data.donors || []);
    } catch (err) {
      console.error('Error searching donors:', err);
      setSearchResults([]);
    }
  };

  const handleSelectDonor = (donor) => {
    setSelectedDonor(donor);
    setDonationForm({
      ...donationForm,
      name: donor.name,
      email: donor.email,
      phone: donor.phone || '',
      bloodType: donor.bloodType || 'A+',
      location: donor.location || '',
      password: '' // Clear password when selecting existing donor
    });
    setSearchResults([]);
    setDonorSearchQuery('');
  };

  const handleRecordDonation = async (e) => {
    e.preventDefault();
    
    if (!selectedDonor && (!donationForm.name || !donationForm.email)) {
      alert('Please search for existing donor or fill in name and email for new donor');
      return;
    }
    
    // Password is required when creating a new donor (not when using existing donor)
    if (!selectedDonor && !donationForm.password) {
      alert('Password is required when creating a new donor');
      return;
    }
    
    try {
      const donationData = {
        ...(selectedDonor ? { donorId: selectedDonor._id || selectedDonor.id } : {}),
        name: donationForm.name,
        email: donationForm.email,
        phone: donationForm.phone,
        bloodType: donationForm.bloodType,
        location: donationForm.location,
        ...(selectedDonor ? {} : { password: donationForm.password }), // Only include password for new donors
        units: parseInt(donationForm.units) || 1,
        notes: donationForm.notes
      };
      
      await bloodBankAPI.recordDonation(donationData);
      
      alert('Donation recorded successfully!');
      
      // Reset form
      setShowRecordDonation(false);
      setSelectedDonor(null);
      setDonationForm({
        name: '',
        email: '',
        phone: '',
        bloodType: 'A+',
        location: '',
        password: '',
        units: 1,
        notes: ''
      });
      setDonorSearchQuery('');
      setSearchResults([]);
      
      // Refresh data
      loadDashboardData();
    } catch (err) {
      console.error('Error recording donation:', err);
      alert('Failed to record donation: ' + (err.response?.data?.message || 'Error'));
    }
  };

  const handleSendReminder = async (donorId) => {
    try {
      await bloodBankAPI.sendReminder(donorId);
      alert('Reminder sent successfully!');
      loadDashboardData();
    } catch (err) {
      alert('Failed to send reminder: ' + (err.response?.data?.message || 'Error'));
    }
  };

  const handleScheduleAppointment = async () => {
    if (!appointmentForm.donorId || !appointmentForm.appointmentDate || !appointmentForm.appointmentTime) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const appointmentDateTime = new Date(`${appointmentForm.appointmentDate}T${appointmentForm.appointmentTime}`);
      await bloodBankAPI.scheduleAppointment(appointmentForm.donorId, appointmentDateTime.toISOString());
      alert('Appointment scheduled successfully!');
      setShowScheduleAppointment(false);
      setAppointmentForm({ donorId: '', appointmentDate: '', appointmentTime: '' });
      loadDashboardData();
    } catch (err) {
      alert('Failed to schedule appointment: ' + (err.response?.data?.message || 'Error'));
    }
  };

  const handleMarkDonationDone = async (donationId) => {
    try {
      const response = await bloodBankAPI.markDonationDone(donationId);
      if (response.data.donor) {
        // Pre-fill the record donation form with donor info
        setSelectedDonor({
          _id: response.data.donor.id,
          id: response.data.donor.id,
          name: response.data.donor.name,
          email: response.data.donor.email,
          phone: response.data.donor.phone,
          bloodType: response.data.donor.bloodType,
          location: response.data.donor.location
        });
        setDonationForm({
          name: response.data.donor.name,
          email: response.data.donor.email,
          phone: response.data.donor.phone || '',
          bloodType: response.data.donor.bloodType || 'A+',
          location: response.data.donor.location || '',
          password: '',
          units: 1,
          notes: ''
        });
        setShowRecordDonation(true);
        loadDashboardData();
      }
    } catch (err) {
      alert('Failed to load donor info: ' + (err.response?.data?.message || 'Error'));
    }
  };

  const urgentNotifications = appointments.filter(apt => apt.isToday).length + hospitalRequests.filter(r => r.priority === 'critical' || r.priority === 'urgent').length;

  return (
    <div className="dashboard-page min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-8 animate-fade-in">
        <div className="flex flex-nowrap justify-between items-start gap-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight shrink min-w-0">
            {t('dashboard.welcome')}, <span className="text-primary-600">{user?.name || t('auth.role.bloodbank')}</span>!
          </h1>
          <div className="flex items-center gap-2 shrink-0 flex-shrink-0">
            <LanguageSwitcher />
            <button
              onClick={async () => {
                setProfileSignature(null);
                try {
                  const res = await authAPI.getMe();
                  const u = res.data?.user;
                  if (u) {
                    const normalized = { ...u, id: u.id || u._id?.toString?.() };
                    setUser(normalized);
                    setStoredUser(normalized);
                    setProfileForm({
                      name: u.name || '',
                      phone: u.phone || '',
                      address: {
                        street: u.address?.street || '',
                        area: u.address?.area || '',
                        city: u.address?.city || '',
                        state: u.address?.state || '',
                        pincode: u.address?.pincode || ''
                      }
                    });
                  } else {
                    setProfileForm({ name: user?.name || '', phone: user?.phone || '', address: { street: user?.address?.street || '', area: user?.address?.area || '', city: user?.address?.city || '', state: user?.address?.state || '', pincode: user?.address?.pincode || '' } });
                  }
                  setShowProfileModal(true);
                } catch (err) {
                  setProfileForm({ name: user?.name || '', phone: user?.phone || '', address: { street: user?.address?.street || '', area: user?.address?.area || '', city: user?.address?.city || '', state: user?.address?.state || '', pincode: user?.address?.pincode || '' } });
                  setShowProfileModal(true);
                }
              }}
              className="btn-secondary-dash"
            >
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">{t('bloodbank.profile.title')}</span>
            </button>
            <button onClick={handleLogout} className="btn-primary-dash">
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">{t('nav.logout')}</span>
            </button>
          </div>
        </div>
        <p className="text-gray-600 mt-2 max-w-xl">{t('home.bloodbank.desc')}</p>
        {urgentNotifications > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-sky-50 border border-sky-200 text-sky-800 rounded-xl text-sm font-semibold shadow-sm animate-pulse-soft">
            <AlertCircle className="w-5 h-5 text-sky-600" />
            {t('bloodbank.pendingActions', { count: urgentNotifications })}
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="mb-8 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-3 font-medium transition-all ${activeTab === 'dashboard' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600 hover:text-gray-900'}`}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-3 font-medium transition-all ${activeTab === 'campaigns' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600 hover:text-gray-900'}`}
        >
          📢 Campaigns
        </button>
      </div>

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && <BloodBankEventManagement />}

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
      <>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card animate-fade-in-up opacity-0 flex items-center gap-4 stagger-1">
          <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center">
            <Droplets className="w-8 h-8 text-sky-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{t('bloodbank.inventory.title')}</h3>
            <p className="text-3xl font-bold text-sky-600 mt-0.5">{totalUnits}</p>
          </div>
        </div>
        <div className="stat-card animate-fade-in-up opacity-0 flex items-center gap-4 stagger-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center">
            <Users className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{t('bloodbank.stats.eligibleDonors')}</h3>
            <p className="text-3xl font-bold text-amber-600 mt-0.5">{eligibleDonors.length}</p>
          </div>
        </div>
        <div className="stat-card animate-fade-in-up opacity-0 flex items-center gap-4 stagger-3">
          <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-violet-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{t('bloodbank.stats.scheduledAppointments')}</h3>
            <p className="text-3xl font-bold text-violet-600 mt-0.5">{appointments.length}</p>
          </div>
        </div>
        <div className="stat-card animate-fade-in-up opacity-0 flex items-center gap-4 stagger-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-rose-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{t('bloodbank.requests.title')}</h3>
            <p className="text-3xl font-bold text-rose-600 mt-0.5">{hospitalRequests.length}</p>
          </div>
        </div>
      </div>

      {/* Record Donation Section */}
      <div className="mb-8 animate-fade-in-up opacity-0 stagger-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Droplets className="w-7 h-7 text-primary-500" />
            {t('bloodbank.recordDonation.title')}
          </h2>
          <button
            onClick={() => {
              setShowRecordDonation(!showRecordDonation);
              if (showRecordDonation) {
                setSelectedDonor(null);
                setDonationForm({
                  name: '',
                  email: '',
                  phone: '',
                  bloodType: 'A+',
                  location: '',
                  password: '',
                  units: 1,
                  notes: ''
                });
                setDonorSearchQuery('');
                setSearchResults([]);
              }
            }}
            className="btn-primary-dash"
          >
            <PlusCircle className="w-5 h-5" />
            {showRecordDonation ? t('dashboard.cancel') : t('bloodbank.recordDonation.addRecord')}
          </button>
        </div>

        {showRecordDonation && (
          <div className="dashboard-card p-6 mb-6 border-2 border-primary-200 animate-scale-in">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('bloodbank.recordDonation.recordToday')}</h3>
            
            {/* Donor Search */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('bloodbank.recordDonation.searchExisting')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={donorSearchQuery}
                  onChange={(e) => handleSearchDonors(e.target.value)}
                  placeholder={t('bloodbank.recordDonation.searchPlaceholder')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                />
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((donor) => (
                      <button
                        key={donor._id || donor.id}
                        type="button"
                        onClick={() => handleSelectDonor(donor)}
                        className="w-full text-left px-4 py-2 hover:bg-green-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-semibold">{donor.name}</div>
                        <div className="text-sm text-gray-600">
                          {donor.email} • {donor.phone} • {donor.bloodType}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selectedDonor && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-green-800">{t('bloodbank.recordDonation.selected')} {selectedDonor.name}</span>
                      <span className="ml-2 text-sm text-green-600">({selectedDonor.email})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDonor(null);
                        setDonationForm({
                          ...donationForm,
                          name: '',
                          email: '',
                          phone: '',
                          bloodType: 'A+',
                            location: '',
                            password: ''
                        });
                      }}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      {t('bloodbank.recordDonation.clear')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleRecordDonation} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('bloodbank.recordDonation.donorName')}
                  </label>
                  <input
                    type="text"
                    value={donationForm.name}
                    onChange={(e) => setDonationForm({ ...donationForm, name: e.target.value })}
                    required
                    disabled={!!selectedDonor}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('bloodbank.recordDonation.email')}
                  </label>
                  <input
                    type="email"
                    value={donationForm.email}
                    onChange={(e) => setDonationForm({ ...donationForm, email: e.target.value })}
                    required
                    disabled={!!selectedDonor}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('bloodbank.recordDonation.phone')}
                  </label>
                  <input
                    type="tel"
                    value={donationForm.phone}
                    onChange={(e) => setDonationForm({ ...donationForm, phone: e.target.value })}
                    disabled={!!selectedDonor}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('bloodbank.recordDonation.bloodType')}
                  </label>
                  <select
                    value={donationForm.bloodType}
                    onChange={(e) => setDonationForm({ ...donationForm, bloodType: e.target.value })}
                    required
                    disabled={!!selectedDonor}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none disabled:bg-gray-100"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('bloodbank.recordDonation.location')}
                  </label>
                  <input
                    type="text"
                    value={donationForm.location}
                    onChange={(e) => setDonationForm({ ...donationForm, location: e.target.value })}
                    disabled={!!selectedDonor}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none disabled:bg-gray-100"
                  />
                </div>
                {!selectedDonor && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('bloodbank.recordDonation.password')}
                    </label>
                    <input
                      type="password"
                      value={donationForm.password}
                      onChange={(e) => setDonationForm({ ...donationForm, password: e.target.value })}
                      required={!selectedDonor}
                      placeholder={t('bloodbank.recordDonation.passwordPlaceholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t('bloodbank.recordDonation.passwordHint')}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('bloodbank.recordDonation.unitsDonated')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={donationForm.units}
                    onChange={(e) => setDonationForm({ ...donationForm, units: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('bloodbank.recordDonation.notes')}
                </label>
                <textarea
                  value={donationForm.notes}
                  onChange={(e) => setDonationForm({ ...donationForm, notes: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                  placeholder={t('bloodbank.recordDonation.notesPlaceholder')}
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRecordDonation(false);
                    setSelectedDonor(null);
                    setDonationForm({
                      name: '',
                      email: '',
                      phone: '',
                      bloodType: 'A+',
                      location: '',
                      units: 1,
                      notes: ''
                    });
                    setDonorSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  {t('dashboard.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                >
                  {t('bloodbank.recordDonation.submit')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Blood Inventory */}
      <div className="mb-8 animate-fade-in-up opacity-0 stagger-3">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Droplets className="w-7 h-7 text-primary-500" />
            {t('bloodbank.inventory.title')}
          </h2>
          <button
            onClick={() => setShowAddInventory(!showAddInventory)}
            className="btn-primary-dash"
          >
            <PlusCircle className="w-5 h-5" />
            {showAddInventory ? t('dashboard.cancel') : t('bloodbank.inventory.update')}
          </button>
        </div>

        {/* Add/Update Inventory Form */}
        {showAddInventory && (
          <div className="dashboard-card p-6 mb-6 animate-scale-in">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('bloodbank.inventory.update')}</h3>
            <form onSubmit={handleUpdateInventory} className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('hospital.inventory.bloodType')}</label>
                <select
                  value={inventoryForm.bloodType}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, bloodType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('bloodbank.requests.units')}</label>
                <input
                  type="number"
                  min="0"
                  value={inventoryForm.units}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, units: e.target.value })}
                  placeholder={t('bloodbank.inventory.add')}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                {t('bloodbank.inventory.update')}
              </button>
            </form>
            <p className="text-sm text-gray-500 mt-2">
              {t('bloodbank.inventory.hint')}
            </p>
          </div>
        )}

        <div className="dashboard-card overflow-hidden">
          {inventory.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              {t('dashboard.noData')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-dashboard">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('hospital.inventory.bloodType')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('hospital.inventory.units')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('donor.history.status')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventory.map((item, index) => (
                    <tr key={item._id || index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {item.bloodType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {item.units || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          (item.units || 0) > 10 ? 'bg-green-100 text-green-800' : 
                          (item.units || 0) > 5 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {(item.units || 0) > 10
                            ? t('bloodbank.inventory.status.good')
                            : (item.units || 0) > 5
                              ? t('bloodbank.inventory.status.low')
                              : t('bloodbank.inventory.status.critical')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Eligible Donors */}
      <div className="mb-8 animate-fade-in-up opacity-0 stagger-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-7 h-7 text-primary-500" />
          {t('bloodbank.eligible.title')}
        </h2>
        <div className="dashboard-card overflow-hidden">
          {eligibleDonors.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {t('bloodbank.eligible.empty')}
            </div>
          ) : (
            <div className="divide-y">
              {eligibleDonors.map((item, index) => (
                <div key={item.donor.id || index} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{item.donor.name}</h3>
                      <p className="text-gray-600 mt-1">
                        {t('donor.emergency.bloodType')}: <span className="font-semibold">{item.donor.bloodType}</span> • 
                        {t('donor.profile.phone')}: {item.donor.phone || t('common.na')} • 
                        {t('donor.profile.email') || 'Email'}: {item.donor.email}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {t('bloodbank.eligible.lastDonation')} {new Date(item.lastDonationDate).toLocaleDateString()} • 
                        {t('bloodbank.eligible.daysSince', { count: item.daysSinceLastDonation })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSendReminder(item.donor.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        {t('bloodbank.eligible.remind')}
                      </button>
                      <button
                        onClick={() => {
                          setAppointmentForm({ ...appointmentForm, donorId: item.donor.id });
                          setShowScheduleAppointment(true);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        {t('bloodbank.eligible.schedule')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Schedule Appointment Modal */}
      {showScheduleAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">
              {t('bloodbank.appointments.scheduleTitle')}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('bloodbank.appointments.dateLabel')}
                </label>
                <input
                  type="date"
                  value={appointmentForm.appointmentDate}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, appointmentDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('bloodbank.appointments.timeLabel')}
                </label>
                <input
                  type="time"
                  value={appointmentForm.appointmentTime}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, appointmentTime: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowScheduleAppointment(false);
                  setAppointmentForm({ donorId: '', appointmentDate: '', appointmentTime: '' });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {t('dashboard.cancel')}
              </button>
              <button
                onClick={handleScheduleAppointment}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {t('bloodbank.appointments.scheduleButton')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Appointments */}
      <div className="mb-8 animate-fade-in-up opacity-0 stagger-5">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-7 h-7 text-primary-500" />
          {t('bloodbank.appointments.title')}
        </h2>
        <div className="dashboard-card overflow-hidden">
          {appointments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {t('bloodbank.appointments.empty')}
            </div>
          ) : (
            <div className="divide-y">
              {appointments.map((apt, index) => (
                <div key={apt.id || index} className={`p-6 hover:bg-gray-50 ${apt.isToday ? 'bg-yellow-50 border-l-4 border-yellow-500' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {apt.donor?.name || t('donor.history.bloodBank')}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {t('donor.emergency.bloodType')}: <span className="font-semibold">{apt.bloodType}</span> • 
                        {t('donor.profile.phone')}: {apt.donor?.phone || t('common.na')} • 
                        {t('donor.profile.email') || 'Email'}: {apt.donor?.email || t('common.na')}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {t('bloodbank.appointments.when')} {new Date(apt.appointmentDate).toLocaleString()}
                        {apt.isToday && (
                          <span className="ml-2 px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs font-semibold">
                            {t('bloodbank.appointments.today')}
                          </span>
                        )}
                      </p>
                    </div>
                    {apt.isToday && (
                      <button
                        onClick={() => handleMarkDonationDone(apt.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        {t('bloodbank.appointments.markDone')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hospital Requests */}
      <div className="animate-fade-in-up opacity-0 stagger-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-7 h-7 text-primary-500" />
          {t('bloodbank.requests.title')}
        </h2>
        <div className="dashboard-card overflow-hidden">
          {hospitalRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {t('dashboard.noData')}
            </div>
          ) : (
            <div className="divide-y">
              {hospitalRequests.map((request, index) => (
                <div key={request._id || index} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {request.hospital?.name || t('bloodbank.requests.hospital')}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {t('donor.emergency.bloodType')}: <span className="font-semibold">{request.bloodType}</span> • 
                        {t('bloodbank.requests.units')}: <span className="font-semibold">{request.units}</span> • 
                        {t('hospital.request.urgency')}: <span className={`font-semibold ${request.priority === 'critical' ? 'text-red-600' : 'text-orange-600'}`}>
                          {request.priority}
                        </span>
                      </p>
                      {request.availableUnits !== undefined && (
                        <p className="text-sm text-gray-500 mt-1">
                          Available in inventory: {request.availableUnits} units
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => handleProcessRequest(request._id, request)}
                      className="btn-primary-dash"
                    >
                      {t('bloodbank.requests.approve')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">{t('bloodbank.profile.title')}</h3>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('bloodbank.profile.name')}</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('hospital.profile.phone')}</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
                />
              </div>
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">{t('hospital.profile.address')}</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder={t('hospital.profile.street')}
                    value={profileForm.address?.street || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, address: { ...profileForm.address, street: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
                  />
                  <input
                    type="text"
                    placeholder={t('hospital.profile.district')}
                    value={profileForm.address?.area || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, address: { ...profileForm.address, area: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder={t('hospital.profile.city')}
                      value={profileForm.address?.city || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, address: { ...profileForm.address, city: e.target.value } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
                    />
                    <input
                      type="text"
                      placeholder={t('hospital.profile.state')}
                      value={profileForm.address?.state || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, address: { ...profileForm.address, state: e.target.value } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder={t('hospital.profile.pincode')}
                    value={profileForm.address?.pincode || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, address: { ...profileForm.address, pincode: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
                    maxLength="6"
                  />
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Authorized signature</h4>
                <p className="text-xs text-gray-500 mb-2">Shown on donation certificates. Change or add here if needed.</p>
                <div className="flex flex-wrap items-center gap-3">
                  {(profileSignature !== '' && (profileSignature || user?.signature)) ? (
                    <div className="border border-gray-200 rounded-lg p-2 bg-gray-50 inline-block">
                      <img src={profileSignature || user?.signature} alt="Signature" className="max-h-14 object-contain max-w-[200px]" />
                    </div>
                  ) : profileSignature === '' ? (
                    <span className="text-sm text-gray-500">Signature will be removed on save.</span>
                  ) : null}
                  <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm font-medium text-gray-700">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => setProfileSignature(r.result); r.readAsDataURL(f); } }} />
                    {(profileSignature || user?.signature) ? 'Change image' : 'Choose image'}
                  </label>
                  {(profileSignature || user?.signature) && (
                    <button type="button" onClick={() => setProfileSignature('')} className="text-sm text-gray-500 hover:text-red-600">
                      Remove signature
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={() => setShowProfileModal(false)} className="btn-secondary-dash">
                  {t('dashboard.cancel')}
                </button>
                <button type="submit" disabled={profileSaving} className="btn-primary-dash disabled:opacity-50 disabled:transform-none">
                  {profileSaving ? '...' : t('hospital.profile.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <NotificationModal
        open={notification.open}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        confirmText={notification.confirmText}
        cancelText={notification.cancelText}
        onConfirm={() => {
          if (pendingApprove) {
            const { requestId, request, partialUnits } = pendingApprove;
            if (partialUnits != null) {
              executeApprove(requestId, request, partialUnits);
            } else {
              executeApprove(requestId, request);
            }
          } else {
            closeNotification();
          }
        }}
        onCancel={closeNotification}
      />
      </>
      )}
      </div>
    </div>
  );
};

export default BloodBankDashboard;
