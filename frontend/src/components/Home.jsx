import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import ImageSlider from './ImageSlider';
import api, { bloodBankAPI } from '../services/api';
import { useState } from 'react';

const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-pink-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">❤️</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                {t('nav.lifelink')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Link 
                to="/login" 
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-white hover:shadow-md transition-all duration-200"
              >
                {t('nav.login')}
              </Link>
              <Link 
                to="/register" 
                className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
              >
                {t('nav.register')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-white rounded-full shadow-md">
            <span className="text-red-600 font-semibold text-sm">💉 {t('nav.lifelink')} Blood Donation Platform</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {t('home.hero.title')}
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {t('home.hero.subtitle')}
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link 
              to="/register" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-full hover:shadow-xl hover:scale-105 transition-all duration-200 font-semibold text-lg"
            >
              {t('home.hero.cta')}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          {/* Emergency Button Section */}
          <div className="mt-12 flex flex-col items-center">
            <div className="text-center mb-6">
              <span className="inline-block px-4 py-2 bg-red-100 rounded-full mb-3">
                <span className="text-red-700 font-bold text-sm">🚨 CRITICAL: IN URGENT NEED?</span>
              </span>
              <p className="text-gray-600 font-medium">Find blood banks instantly - every second counts!</p>
            </div>
            <ShowNearbyButton />
          </div>
        </div>
      </header>

      {/* Sliding images - HomoX-style carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <ImageSlider />
      </section>

      {/* Features Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Donor Card */}
          <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2">
            <div className="h-2 bg-gradient-to-r from-red-500 to-pink-500"></div>
            <div className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-4xl">🩸</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">{t('home.donor.title')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('home.donor.desc')}</p>
              <Link 
                to="/register" 
                className="inline-flex items-center mt-6 text-red-600 font-semibold hover:gap-3 transition-all duration-200"
              >
                Get started 
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Hospital Card */}
          <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
            <div className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-4xl">🏥</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">{t('home.hospital.title')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('home.hospital.desc')}</p>
              <Link 
                to="/register" 
                className="inline-flex items-center mt-6 text-blue-600 font-semibold hover:gap-3 transition-all duration-200"
              >
                Get started 
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Blood Bank Card */}
          <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2">
            <div className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
            <div className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-4xl">🏦</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">{t('home.bloodbank.title')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('home.bloodbank.desc')}</p>
              <Link 
                to="/register" 
                className="inline-flex items-center mt-6 text-purple-600 font-semibold hover:gap-3 transition-all duration-200"
              >
                Get started 
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-white rounded-3xl shadow-xl p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">1000+</div>
              <div className="text-gray-600">{t('home.stats.donors')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">{t('home.stats.hospitals')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">20+</div>
              <div className="text-gray-600">{t('home.stats.bloodbanks')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">5000+</div>
              <div className="text-gray-600">{t('home.stats.livesSaved')}</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>&copy; 2026 LifeLink. All rights reserved. Made with ❤️ for saving lives.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;


// Small self-contained component: gets current location and shows top-5 nearby blood banks
function ShowNearbyButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [banks, setBanks] = useState(null);
  const [open, setOpen] = useState(false);

  const fetchNearby = (lat, lng) => {
    setLoading(true);
    setError(null);
    // Use app axios instance so baseURL is consistent and we don't accidentally create /api/api
    api.get('/bloodbank/inventory', { params: { lat, lng } })
      .then(response => {
        const list = response?.data?.data || [];
        // Group by bloodBank._id
        const map = new Map();
        for (const item of list) {
          const bb = item.bloodBank || {};
          const id = bb._id || bb.id || bb.name || JSON.stringify(bb);
          if (!map.has(id)) {
            map.set(id, { id, bank: bb, distance: item.distance ?? null, stocks: {} });
          }
          const entry = map.get(id);
          entry.stocks[item.bloodType] = item.units;
        }
        const arr = Array.from(map.values());
        arr.sort((a,b) => {
          if (a.distance == null) return 1;
          if (b.distance == null) return -1;
          return a.distance - b.distance;
        });
        setBanks(arr.slice(0,5));
        setOpen(true);
      })
      .catch(err => {
        console.error('Nearby banks error', err?.response?.status, err?.message);
        setError('Failed to load nearby blood banks');
      })
      .finally(() => setLoading(false));
  };

  const handleClick = () => {
    setError(null);
    
    // Check if site is served over HTTPS (secure context)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setError('⚠️ Geolocation requires HTTPS. Please access via HTTPS or localhost for location services to work.');
      return;
    }
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchNearby(latitude, longitude);
      },
      (err) => {
        setLoading(false);
        let errorMsg = 'Location permission denied or unavailable';
        
        if (err.code === err.PERMISSION_DENIED) {
          errorMsg = '❌ You denied location permission. Please enable it in your browser settings to find nearby blood banks.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorMsg = '⚠️ Location information is unavailable. Check your GPS or try again.';
        } else if (err.code === err.TIMEOUT) {
          errorMsg = '⏱️ Location request timed out. Please try again.';
        }
        
        setError(errorMsg);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="relative inline-block text-center">
      <button
        onClick={handleClick}
        className="urgent-glow-button-large px-10 py-5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-full hover:scale-110 transition-all flex items-center gap-3 font-bold shadow-2xl text-xl"
        type="button"
      >
        <span className="text-3xl">⚡</span>
        <span className="hidden sm:inline">{loading ? 'Locating...' : 'FIND BLOOD NOW'}</span>
        <span className="sm:hidden">Find Now</span>
      </button>

      {error && (
        <div className="mt-2 text-sm text-rose-600">{error}</div>
      )}

      {open && (
        <div className="absolute left-1/2 transform -translate-x-1/2 mt-4 w-[95vw] max-w-4xl bg-white rounded-xl shadow-xl p-4 z-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold">Nearby blood banks</h4>
            <div className="text-sm text-gray-500">{loading ? 'Searching…' : `${banks?.length ?? 0} results`}</div>
          </div>

          <div className="max-h-[60vh] overflow-auto">
            {loading && (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                ))}
              </div>
            )}

            {!loading && banks && banks.length === 0 && (
              <div className="text-sm text-gray-600">No nearby blood banks found.</div>
            )}

            {!loading && banks && banks.map(b => (
              <div key={b.id} className="border-t last:border-b py-4 first:pt-0 grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="md:col-span-2">
                  <div className="font-semibold text-gray-900">{b.bank.name || b.bank.location || 'Unnamed'}</div>
                  <div className="text-sm text-gray-600 mt-1">{b.bank.fullAddress || b.bank.address?.street || b.bank.location || ''}</div>
                  {b.distance != null && <div className="text-xs text-gray-500 mt-2">{b.distance.toFixed(2)} km</div>}
                </div>
                <div className="md:col-span-1">
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                    {Object.keys(b.stocks || {}).map(bt => (
                      <div key={bt} className="flex items-center justify-between">
                        <div className="text-gray-600">{bt}</div>
                        <div className="font-semibold">{b.stocks[bt]}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-1 flex flex-col justify-center min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-gray-900 min-w-0">
                      {b.bank.phone ? (
                        <a href={`tel:${Array.isArray(b.bank.phone) ? b.bank.phone[0] : b.bank.phone.split(/[,\s]+/)[0]}`} className="text-blue-600 hover:underline break-all">
                          {Array.isArray(b.bank.phone) ? b.bank.phone[0] : b.bank.phone.split(/[,\s]+/)[0]}
                        </a>
                      ) : (
                        <span className="text-gray-400">No phone</span>
                      )}
                    </div>
                    <a
                      href={`tel:${b.bank.phone ? (Array.isArray(b.bank.phone) ? b.bank.phone[0] : b.bank.phone.split(/[,\s]+/)[0]) : ''}` }
                      onClick={(e) => {
                        if (!b.bank.phone) {
                          e.preventDefault();
                          alert('Phone number not available for this blood bank');
                        }
                      }}
                      className={`px-4 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                        b.bank.phone
                          ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      title="Call this blood bank"
                    >
                      CALL
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 text-right">
            <button onClick={() => setOpen(false)} className="text-sm text-gray-600">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
