import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutGrid, List, MapPin, Calendar, LogOut, User, PlusCircle, Droplets, AlertCircle } from 'lucide-react';
import { hospitalAPI, donorAPI, authAPI } from '../../services/api';
import { getUser, clearUser, setUser as saveUser } from '../../utils/auth';
import EventManagement from './EventManagement';
import LanguageSwitcher from '../LanguageSwitcher';
import { calculateAddressDistance } from '../../utils/location';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const HospitalDashboard = () => {
	const { t } = useTranslation(); // Translation hook
	const [availableBlood, setAvailableBlood] = useState([]);
	const [filterBloodType, setFilterBloodType] = useState('');
	const [searchLocation, setSearchLocation] = useState('');
	const [sortBy, setSortBy] = useState('distance'); // 'distance', 'units', 'bloodType', 'name'
	const [minUnits, setMinUnits] = useState('');
	const [showRequestForm, setShowRequestForm] = useState(false);
	const [requestForm, setRequestForm] = useState({
		bloodType: 'A+',
		units: '',
		priority: 'regular',
		notes: ''
	});
	const [user, setUser] = useState(null);
	const [notificationCount, setNotificationCount] = useState(0);
	const [myRequests, setMyRequests] = useState([]);
	const [selectedBloodType, setSelectedBloodType] = useState('');
	const [activeTab, setActiveTab] = useState('inventory');
	const [locationCoords, setLocationCoords] = useState(null); // { lat, lng } when "Use my location" for hospital
	const [locationMessage, setLocationMessage] = useState(null);
	const [showProfileModal, setShowProfileModal] = useState(false);
	const [profileForm, setProfileForm] = useState({
		name: '',
		phone: '',
		address: {
			street: '',
			area: '',
			city: '',
			state: '',
			pincode: ''
		}
	});
	const [profileSaving, setProfileSaving] = useState(false);
	const navigate = useNavigate();

	const fetchBloodInventory = async (coords = null) => {
		try {
			// Get current user to ensure we have latest address data
			const currentUser = getUser();
			if (currentUser && currentUser.address) {
				setUser(currentUser);
			}
			
			// Use the same nearby logic as donor dashboard so results are distance-based,
			// but keep the per-blood-type structure for the hospital table.
			const params =
				coords && typeof coords.lat === 'number' && typeof coords.lng === 'number'
					? { lat: coords.lat, lng: coords.lng }
					: undefined;
			const resp = await donorAPI.getNearbyBloodBanks(params).catch(() => ({ data: { bloodBanks: [] } }));
			const banks = resp.data?.bloodBanks || [];
			console.log('📦 Nearby blood banks received for hospital:', banks.length);

			// Ensure banks are sorted by distance ascending (backend already does this,
			// but we sort defensively here).
			const sortedBanks = [...banks].sort((a, b) => {
				if (a.distance == null) return 1;
				if (b.distance == null) return -1;
				return a.distance - b.distance;
			});

			// Optionally limit to a reasonable number of nearest banks if needed
			// (keep all for now so hospital sees full picture similar to donor).
			const nearestBanks = sortedBanks;

			// Flatten bank-level inventory into per-blood-type rows.
			// IMPORTANT: Also create rows for blood types with no explicit inventory (units=0),
			// so hospitals can still see nearby banks even if they haven't set stock yet.
			const items = nearestBanks.flatMap((bank) => {
				const invMap = new Map(
					(bank.inventory || []).map((iv) => [iv.bloodType, iv.units])
				);
				return BLOOD_TYPES.map((bt) => ({
					_id: `${bank._id}-${bt}`,
					bloodBank: {
						name: bank.name,
						phone: bank.phone,
						location: bank.location,
						address: bank.address,
						latitude: bank.latitude,
						longitude: bank.longitude,
					},
					bloodType: bt,
					units: invMap.get(bt) ?? 0,
					distance: bank.distance ?? null,
				}));
			});
			console.log('📦 Inventory rows built from nearby blood banks:', items.length);
			
			// Helper function to format full address
			const formatFullAddress = (address) => {
				if (!address || typeof address !== 'object') return null;
				const parts = [];
				if (address.street) parts.push(address.street);
				if (address.area) parts.push(address.area);
				if (address.city) parts.push(address.city);
				if (address.state) parts.push(address.state);
				if (address.pincode) parts.push(address.pincode);
				return parts.length > 0 ? parts.join(', ') : null;
			};
			
			// Normalize items to array of objects
			const normalized = (items || []).map(item => {
				const bloodBank = item.bloodBank || {};
				const address = bloodBank.address || item.address || {};
				
				// Calculate distance if not provided by backend
				let distance = item.distance;
				if ((distance === null || distance === undefined || isNaN(distance)) && user?.address && address) {
					distance = calculateAddressDistance(user.address, address);
				}
				
				return {
					_id: item._id,
					bloodBankName: bloodBank.name || item.bloodBankName || 'Unknown',
					bloodType: item.bloodType,
					quantity: item.units ?? item.quantity ?? 0,
					location: bloodBank.location || item.location || '',
					fullAddress: bloodBank.fullAddress || formatFullAddress(address) || bloodBank.location || item.location || '',
					contact: bloodBank.phone || item.contact || '',
					latitude: bloodBank.latitude || item.latitude,
					longitude: bloodBank.longitude || item.longitude,
					address: address,
					distance: distance
				};
			});
			
			console.log('📍 Normalized items with distance:', normalized.slice(0, 3).map(n => ({ 
				name: n.bloodBankName, 
				distance: n.distance,
				pincode: n.address?.pincode,
				hasAddress: !!(n.address?.pincode)
			})));
			
			// Sort by distance if available (backend calculates it)
			// Otherwise fallback to frontend calculation
			let sorted = normalized;
			
			// Get current user again to ensure we have latest data
			const currentUserForCalc = getUser() || user;
			
			// Calculate missing distances using address matching
			sorted = sorted.map(item => {
				// If distance is missing or invalid, try to calculate it
				if (item.distance === null || item.distance === undefined || isNaN(item.distance)) {
					// Try with current user from state first, then from localStorage
					const hospitalAddress = currentUserForCalc?.address || user?.address;
					
					if (hospitalAddress && item.address) {
						const dist = calculateAddressDistance(hospitalAddress, item.address);
						if (dist !== null && !isNaN(dist)) {
							console.log(`✅ Calculated distance for ${item.bloodBankName}: ${dist} km`);
							return { ...item, distance: dist };
						}
					}
					
					// Fallback: Use location strings for basic matching
					const hospitalLocation = currentUserForCalc?.location || user?.location || '';
					const bloodBankLocation = item.location || '';
					
					if (hospitalLocation && bloodBankLocation) {
						const loc1 = hospitalLocation.toLowerCase();
						const loc2 = bloodBankLocation.toLowerCase();
						
						// Same exact location
						if (loc1 === loc2) {
							console.log(`✅ Same location for ${item.bloodBankName}: 1 km`);
							return { ...item, distance: 1 };
						}
						
						// Extract city names (first part before comma)
						const city1 = loc1.split(',')[0].trim();
						const city2 = loc2.split(',')[0].trim();
						
						if (city1 === city2 && city1.length > 0) {
							console.log(`✅ Same city for ${item.bloodBankName}: 5 km`);
							return { ...item, distance: 5 };
						}
						
						// Check if cities are mentioned in each other's location
						if (loc1.includes(city2) || loc2.includes(city1)) {
							console.log(`✅ Related location for ${item.bloodBankName}: 8 km`);
							return { ...item, distance: 8 };
						}
					}
					
					console.log(`⚠️ Cannot calculate distance for ${item.bloodBankName}:`, {
						hasUserAddress: !!hospitalAddress,
						hasItemAddress: !!item.address,
						userLocation: hospitalLocation,
						itemLocation: bloodBankLocation
					});
				}
				return item;
			});
			
			// Sort by distance
			sorted = sorted.sort((a, b) => {
				if (a.distance === null || a.distance === undefined || isNaN(a.distance)) return 1;
				if (b.distance === null || b.distance === undefined || isNaN(b.distance)) return -1;
				return a.distance - b.distance;
			});
			
			setAvailableBlood(sorted);

			// Count low inventory items for notifications
			const lowInventory = normalized.filter(item => item.quantity < 10).length;
			setNotificationCount(lowInventory);
		} catch (err) {
			console.error('Failed to fetch inventory', err);
		}
	};

	const handleUseMyLocation = () => {
		setLocationMessage(null);
		if (!navigator.geolocation) {
			setLocationMessage(t('location.unsupported') || 'Location is not supported by your browser.');
			return;
		}
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				const lat = pos.coords.latitude;
				const lng = pos.coords.longitude;
				setLocationCoords({ lat, lng });
				setLocationMessage(t('location.usingMyLocation') || 'Showing distance from your current location.');
				fetchBloodInventory({ lat, lng });
			},
			(err) => {
				setLocationCoords(null);
				if (err.code === 1) {
					setLocationMessage(
						t('donor.nearby.locationDenied') ||
							'Location access denied. Allow location to see distance from you.'
					);
				} else {
					setLocationMessage(t('location.error') || 'Could not get your location. Try again.');
				}
			},
			{ enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
		);
	};

	const fetchMyRequests = async () => {
		try {
			const currentUser = getUser();
			console.log('\n========== FETCH MY REQUESTS (Frontend) ==========');
			console.log('Current user:', currentUser);
			console.log('Hospital ID:', currentUser?.id);
			console.log('Hospital ID type:', typeof currentUser?.id);
			console.log('Hospital ID string:', String(currentUser?.id));
			
			const resp = await hospitalAPI.getRequests();
			console.log('API Response status:', resp.status);
			console.log('API Response data:', resp.data);
			console.log('Number of requests:', resp.data.requests?.length || 0);
			
			if (resp.data.requests && resp.data.requests.length > 0) {
				console.log('✅ Requests found!');
				resp.data.requests.forEach((req, idx) => {
					console.log(`Request ${idx + 1}:`, {
						_id: req._id,
						bloodType: req.bloodType,
						units: req.units,
						status: req.status,
						hospital: req.hospital?._id || req.hospital,
						responseCount: req.responseCount,
						donorResponses: req.donorResponses?.length || 0,
						hasDonorResponses: !!req.donorResponses
					});
					if (req.donorResponses && req.donorResponses.length > 0) {
						console.log(`  📋 Donor responses for request ${idx + 1}:`, req.donorResponses);
					}
				});
			} else {
				console.log('⚠️ No requests in response');
				console.log('Response keys:', Object.keys(resp.data || {}));
			}
			
			const requests = resp.data?.requests || resp.data?.data || [];
			console.log('Setting requests to state:', requests.length);
			console.log('Sample request with responses:', requests[0]);
			setMyRequests(requests);
			console.log('==================================\n');
		} catch (err) {
			console.error('❌ Failed to fetch requests:', err);
			console.error('Error response:', err.response?.data);
			console.error('Error status:', err.response?.status);
			setMyRequests([]);
		}
	};

	const handleCreateRequest = async (e) => {
		e.preventDefault();
		try {
			const currentUser = getUser();
			console.log('\n========== CREATE REQUEST (Frontend) ==========');
			console.log('Current user:', currentUser);
			console.log('Hospital ID:', currentUser?.id);
			console.log('Request form data:', requestForm);
			
			const response = await hospitalAPI.createBloodRequest(requestForm);
			console.log('✅ Created request response:', response.data);
			console.log('Created request ID:', response.data.data?._id);
			console.log('Created request hospital:', response.data.data?.hospital);
			console.log('==================================\n');
			
			alert(t('message.requestCreated'));
			setShowRequestForm(false);
			setRequestForm({ bloodType: 'A+', units: '', priority: 'regular', notes: '' });
			
			// Wait a moment then refresh requests
			setTimeout(async () => {
				await fetchMyRequests();
			}, 500);
		} catch (err) {
			console.error('❌ Create request error:', err);
			console.error('Error response:', err.response?.data);
			alert('Failed to create request: ' + (err.response?.data?.message || 'Error'));
		}
	};

	useEffect(() => {
		const currentUser = getUser();
		if (!currentUser) {
			navigate('/login');
			return;
		}
		setUser(currentUser);
		setProfileForm({
			name: currentUser.name || '',
			phone: currentUser.phone || '',
			address: {
				street: currentUser.address?.street || '',
				area: currentUser.address?.area || '',
				city: currentUser.address?.city || '',
				state: currentUser.address?.state || '',
				pincode: currentUser.address?.pincode || ''
			}
		});
		console.log('🏥 Hospital user loaded:', {
			id: currentUser.id,
			name: currentUser.name,
			latitude: currentUser.latitude,
			longitude: currentUser.longitude,
			address: currentUser.address,
			hasAddress: !!(currentUser.address && currentUser.address.pincode),
			hasCoords: !!(currentUser.latitude && currentUser.longitude)
		});
		
		// initial fetch (no coords; backend uses hospital profile/address if available)
		fetchBloodInventory();
		fetchMyRequests();
		
		// Auto-refresh: inventory every 60s, My Requests every 5s (per LATEST_CHANGES.md)
		const inventoryInterval = setInterval(fetchBloodInventory, 60000);
		const requestsInterval = setInterval(fetchMyRequests, 5000);
		
		return () => {
			clearInterval(inventoryInterval);
			clearInterval(requestsInterval);
		};
	}, [navigate]);

	// Filter blood inventory based on selected filters
	const filteredBlood = availableBlood.filter(item => {
		const matchesBloodType = !filterBloodType || item.bloodType === filterBloodType;
		const matchesLocation = !searchLocation ||
			(item.location && item.location.toLowerCase().includes(searchLocation.toLowerCase())) ||
			(item.bloodBankName && item.bloodBankName.toLowerCase().includes(searchLocation.toLowerCase())) ||
			(item.fullAddress && item.fullAddress.toLowerCase().includes(searchLocation.toLowerCase()));
		return matchesBloodType && matchesLocation;
	});

	// Group inventory by blood type showing all banks
	const groupedByBloodType = availableBlood.reduce((acc, item) => {
		if (!acc[item.bloodType]) {
			acc[item.bloodType] = [];
		}
		acc[item.bloodType].push(item);
		return acc;
	}, {});
	const bloodTypes = BLOOD_TYPES;

	const handleLogout = () => {
		clearUser();
		navigate('/login');
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
					// Map CSV-style district into address.area
					area: profileForm.address?.area || '',
					city: profileForm.address?.city || '',
					state: profileForm.address?.state || '',
					pincode: profileForm.address?.pincode || ''
				}
			};
			const resp = await authAPI.updateProfile(payload);
			const updatedUser = resp.data?.user || { ...(getUser() || {}), ...payload };
			// Persist updated user for distance calculations
			saveUser(updatedUser);
			setUser(updatedUser);
			setShowProfileModal(false);
			alert(t('hospital.profile.updated'));
			// Refresh inventory so distances reflect new address when not using live coords
			if (!locationCoords) {
				fetchBloodInventory();
			}
		} catch (err) {
			console.error('Failed to update hospital profile', err);
			alert(err.response?.data?.message || 'Failed to update profile');
		} finally {
			setProfileSaving(false);
		}
	};

	return (
		<div className="dashboard-page min-h-screen">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
			{/* Header: title left, language + profile + actions top right */}
			<div className="mb-8 animate-fade-in">
				<div className="flex flex-nowrap justify-between items-start gap-4">
					<h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight shrink min-w-0">
						{t('dashboard.welcome')}, <span className="text-primary-600">{user?.name || t('auth.role.hospital')}</span>!
					</h1>
					<div className="flex items-center gap-2 shrink-0 flex-shrink-0">
						<LanguageSwitcher />
						<button onClick={() => setShowProfileModal(true)} className="btn-secondary-dash">
							<User className="w-5 h-5" />
							<span className="hidden sm:inline">{t('hospital.profile.title')}</span>
						</button>
						<button
							onClick={() => setShowRequestForm(!showRequestForm)}
							className="btn-primary-dash"
						>
							<PlusCircle className="w-5 h-5" />
							<span className="hidden sm:inline">{showRequestForm ? t('dashboard.cancel') : t('hospital.request.create')}</span>
						</button>
						<button onClick={handleLogout} className="btn-primary-dash">
							<LogOut className="w-5 h-5" />
							<span className="hidden sm:inline">{t('nav.logout')}</span>
						</button>
					</div>
				</div>
				<p className="text-gray-600 mt-2 max-w-xl">{t('home.hospital.desc') || 'Manage blood requests and track inventory'}</p>
				{notificationCount > 0 && (
					<div className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm font-semibold shadow-sm animate-pulse-soft">
						<AlertCircle className="w-5 h-5 text-amber-600" />
						{notificationCount} blood type(s) running low
					</div>
				)}
			</div>

			{/* Tabs */}
			<div className="dashboard-card mb-8 p-2 flex flex-wrap gap-2">
				<button
					onClick={() => setActiveTab('inventory')}
					className={`tab-pill ${activeTab === 'inventory' ? 'tab-pill-active' : 'tab-pill-inactive'}`}
				>
					<Droplets className="w-5 h-5 inline-block mr-2 -mt-0.5" />
					{t('hospital.inventory.title')}
				</button>
				<button
					onClick={() => setActiveTab('requests')}
					className={`tab-pill ${activeTab === 'requests' ? 'tab-pill-active' : 'tab-pill-inactive'}`}
				>
					<List className="w-5 h-5 inline-block mr-2 -mt-0.5" />
					{t('hospital.myRequests.title')}
				</button>
				<button
					onClick={() => setActiveTab('events')}
					className={`tab-pill ${activeTab === 'events' ? 'tab-pill-active' : 'tab-pill-inactive'}`}
				>
					<Calendar className="w-5 h-5 inline-block mr-2 -mt-0.5" />
					{t('events.title')}
				</button>
			</div>

			{/* Create Blood Request Form - Available on all tabs */}
			{showRequestForm && (
				<div className="dashboard-card p-6 mb-8 border-2 border-primary-200 animate-fade-in-up">
					<h3 className="text-xl font-semibold text-gray-900 mb-4">{t('hospital.request.create')}</h3>
					<form onSubmit={handleCreateRequest} className="space-y-4">
						<div className="grid md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">{t('hospital.request.bloodType')} *</label>
								<select
									value={requestForm.bloodType}
									onChange={(e) => setRequestForm({ ...requestForm, bloodType: e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
									required
								>
									{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
										<option key={type} value={type}>{type}</option>
									))}
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">{t('hospital.request.units')} *</label>
								<input
									type="number"
									min="1"
									value={requestForm.units}
									onChange={(e) => setRequestForm({ ...requestForm, units: e.target.value })}
									placeholder="Enter number of units"
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
									required
								/>
							</div>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">{t('hospital.request.urgency')} *</label>
							<select
								value={requestForm.priority}
								onChange={(e) => setRequestForm({ ...requestForm, priority: e.target.value })}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
								required
							>
								<option value="critical">Critical - Immediate Need</option>
								<option value="urgent">{t('hospital.request.urgent')} - Within 24 Hours</option>
								<option value="regular">{t('hospital.request.normal')} - Within a Week</option>
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Notes / Reason</label>
							<textarea
								value={requestForm.notes}
								onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
								placeholder="Provide details about the patient or reason for request..."
								rows="3"
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
							></textarea>
						</div>
						<div className="flex gap-3 justify-end">
							<button type="button" onClick={() => setShowRequestForm(false)} className="btn-secondary-dash">
								{t('dashboard.cancel')}
							</button>
							<button type="submit" className="btn-primary-dash">
								{t('hospital.request.submit')}
							</button>
						</div>
					</form>
				</div>
			)}

			{/* Events Tab */}
			{activeTab === 'events' && <EventManagement />}

			{/* Inventory Tab */}
			{activeTab === 'inventory' && (
				<React.Fragment>
			<h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2 animate-fade-in-up">
				<Droplets className="w-7 h-7 text-primary-500" />
				{t('hospital.inventory.title')}
			</h2>

			{/* Use my location + message banner */}
			<div className="mb-6 flex flex-wrap items-center gap-3">
				<button
					type="button"
					onClick={handleUseMyLocation}
					className="btn-primary-dash"
				>
					<MapPin className="w-5 h-5" />
					{t('donor.nearby.useMyLocation') || 'Use my location'}
				</button>
				{locationCoords && (
					<button
						type="button"
						onClick={() => {
							setLocationCoords(null);
							setLocationMessage(null);
							fetchBloodInventory();
						}}
						className="btn-secondary-dash"
					>
						{t('location.clearLocation') || 'Clear location'}
					</button>
				)}
				{locationMessage && (
					<span className={`text-sm ${
						locationMessage.includes('denied') ||
						locationMessage.includes('error') ||
						locationMessage.includes('Could not')
							? 'text-amber-700 bg-amber-50 px-3 py-1 rounded'
							: 'text-blue-700 bg-blue-50 px-3 py-1 rounded'
					}`}>
						{locationMessage}
					</span>
				)}
			</div>

			{/* View Toggle */}
			<div className="mb-4 flex gap-2">
				<button
					onClick={() => setSelectedBloodType('')}
					className={`px-4 py-2 rounded-lg font-medium ${
						!selectedBloodType ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
					}`}
				>
					{t('hospital.inventory.view')}
				</button>
				<button
					onClick={() => setSelectedBloodType('grouped')}
					className={`px-4 py-2 rounded-lg font-medium ${
						selectedBloodType === 'grouped' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
					}`}
				>
					{t('hospital.inventory.grouped')}
				</button>
			</div>
			
			{/* Grouped View by Blood Type */}
			{selectedBloodType === 'grouped' ? (
				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
					{bloodTypes.map(type => {
						const banks = groupedByBloodType[type] || [];
						const totalUnits = banks.reduce((sum, b) => sum + b.quantity, 0);
						return (
							<div key={type} className="stat-card p-4">
								<div className="flex justify-between items-center mb-3">
									<h3 className="text-xl font-bold text-gray-900">{type}</h3>
									<span className={`text-2xl font-bold ${
										totalUnits > 20 ? 'text-green-600' : 
										totalUnits > 10 ? 'text-yellow-600' : 
										'text-red-600'
									}`}>
										{totalUnits}
									</span>
								</div>
								{banks.length === 0 ? (
									<p className="text-sm text-gray-500">No banks available</p>
								) : (
									<select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-600 outline-none">
										<option value="">Select Blood Bank ({banks.length})</option>
										{banks.map((bank, idx) => (
											<option key={idx} value={bank._id}>
												{bank.bloodBankName} - {bank.quantity} units{bank.distance !== null && bank.distance !== undefined ? ` (${bank.distance.toFixed(1)} km)` : ''}
											</option>
										))}
									</select>
								)}
								{banks.length > 0 && (
									<div className="mt-2 text-xs text-gray-500">
										Available at {banks.length} location(s)
									</div>
								)}
							</div>
						);
					})}
				</div>
			) : (
				<>
			{/* Search and Filter Section */}
			<div className="dashboard-card p-4 mb-6">
				<div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
					<div className="lg:col-span-2">
						<label className="block text-sm font-medium text-gray-700 mb-1">Search Location / Blood Bank</label>
						<input
							type="text"
							placeholder="Search by location or blood bank name..."
							value={searchLocation}
							onChange={(e) => setSearchLocation(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Filter Blood Type</label>
						<select
							value={filterBloodType}
							onChange={(e) => setFilterBloodType(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
						>
							<option value="">All Types</option>
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
						<label className="block text-sm font-medium text-gray-700 mb-1">Min Units Available</label>
						<input
							type="number"
							min="0"
							placeholder="Any"
							value={minUnits}
							onChange={(e) => setMinUnits(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
						<select
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
						>
							<option value="distance">📍 Distance (Closest)</option>
							<option value="units">🩸 Units (Highest)</option>
							<option value="bloodType">🅰️ Blood Type</option>
							<option value="name">🏥 Blood Bank Name</option>
						</select>
					</div>
				</div>
				{(filterBloodType || searchLocation || minUnits) && (
					<div className="flex items-center gap-2">
						<span className="text-sm text-gray-600">
							Showing {filteredBlood.length} of {availableBlood.length} results
						</span>
						<button
							onClick={() => {
								setFilterBloodType('');
								setSearchLocation('');
								setMinUnits('');
								setSortBy('distance');
							}}
							className="ml-auto px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium"
						>
							Clear All Filters
						</button>
					</div>
				)}
			</div>

			<div className="overflow-x-auto bg-white rounded-lg shadow">
				<table className="min-w-full table-dashboard">
					<thead>
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
								{t('hospital.inventory.bloodBank')}
								{sortBy === 'name' && <span className="ml-1">↓</span>}
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
								{t('hospital.inventory.bloodType')}
								{sortBy === 'bloodType' && <span className="ml-1">↓</span>}
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
								{t('hospital.inventory.units')}
								{sortBy === 'units' && <span className="ml-1">↓</span>}
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('hospital.inventory.location')}</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
								Distance
								{sortBy === 'distance' && <span className="ml-1">↓</span>}
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('hospital.inventory.contact')}</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{filteredBlood.length === 0 ? (
							<tr>
								<td colSpan={6} className="px-6 py-4 text-center text-gray-500">
									{availableBlood.length === 0 ? t('dashboard.noData') : 'No results match your filters'}
								</td>
							</tr>
						) : (
							filteredBlood.map(item => (
								<tr key={item._id} className="hover:bg-gray-50">
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										<div className="font-medium">{item.bloodBankName}</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
										<span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded">
											{item.bloodType}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
										<span className={`font-semibold ${
											item.quantity > 20 ? 'text-green-600' : 
											item.quantity > 10 ? 'text-yellow-600' : 
											'text-red-600'
										}`}>
											{item.quantity} units
										</span>
									</td>
									<td className="px-6 py-4 text-sm text-gray-700">
										<div className="max-w-xs">
											{item.fullAddress ? (
												<div className="text-gray-900 font-medium">{item.fullAddress}</div>
											) : (
												<div className="text-gray-600">{item.location || 'Address not available'}</div>
											)}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
										{item.distance !== null && item.distance !== undefined && !isNaN(item.distance) ? (
											<span className="px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full">
												📍 {item.distance.toFixed(1)} km
											</span>
										) : (
											<span className="text-xs text-gray-400">N/A</span>
										)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.contact}</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
			</>
			)}
			</React.Fragment>
			)}

			{activeTab === 'requests' && (
				<div className="bg-white rounded-lg shadow-lg p-6">
					<div className="flex justify-between items-center mb-4">
						<h3 className="text-xl font-semibold text-gray-900">{t('hospital.myRequests.title')}</h3>
						<button
							onClick={fetchMyRequests}
							className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
						>
							🔄 Refresh
						</button>
					</div>
					{myRequests.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-gray-500 mb-4">{t('dashboard.noData')}</p>
							<p className="text-sm text-gray-400">Hospital ID: {user?.id}</p>
							<button
								onClick={fetchMyRequests}
								className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
							>
								Try Refreshing
							</button>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="min-w-full table-dashboard">
								<thead>
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('hospital.inventory.bloodType')}</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('hospital.inventory.units')}</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('hospital.request.urgency')}</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('hospital.myRequests.status')}</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blood Bank</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('hospital.myRequests.date')}</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responses</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{myRequests.map(request => (
										<>
											<tr key={request._id} className="hover:bg-gray-50">
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.bloodType}</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{request.units}</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm">
													<span className={`px-2 py-1 rounded-full text-xs font-medium ${
														request.priority === 'critical' ? 'bg-red-100 text-red-700' : 
														request.priority === 'urgent' ? 'bg-orange-100 text-orange-700' : 
														'bg-blue-100 text-blue-700'
													}`}>
														{request.priority}
													</span>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm">
													<span className={`px-2 py-1 rounded-full text-xs font-medium ${
														request.status === 'fulfilled' ? 'bg-green-100 text-green-700' :
														request.status === 'approved' ? 'bg-blue-100 text-blue-700' :
														'bg-yellow-100 text-yellow-700'
													}`}>
														{request.status === 'fulfilled' ? t('hospital.myRequests.completed') : 
														 request.status === 'approved' ? t('hospital.myRequests.approved') : 
														 request.status === 'pending' ? t('hospital.myRequests.pending') : 
														 request.status}
													</span>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
													{request.bloodBank?.name || 'Not assigned'}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
													{new Date(request.createdAt).toLocaleDateString()}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
													{(request.responseCount || request.donorResponses?.length || 0) > 0 ? (
														<span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
															{request.responseCount || request.donorResponses?.length || 0} donor{(request.responseCount || request.donorResponses?.length || 0) !== 1 ? 's' : ''} responded
														</span>
													) : (
														<span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
															0 responses
														</span>
													)}
												</td>
											</tr>
											{((request.donorResponses && request.donorResponses.length > 0) || (request.responseCount > 0)) && (
												<tr>
													<td colSpan={7} className="px-6 py-4 bg-gray-50">
													<div className="space-y-3">
														<h4 className="font-semibold text-sm text-gray-700 mb-2">
															👥 Donor Responses ({(request.donorResponses || []).length})
														</h4>
														<div className="space-y-2">
															{(request.donorResponses || []).map((response, idx) => (
																	<div key={response._id || idx} className="bg-white p-3 rounded-lg border border-gray-200">
																		<div className="flex justify-between items-start">
																			<div className="flex-1">
																				<div className="flex items-center gap-3 mb-1">
																					<span className="font-semibold text-gray-900">
																						{response.donor?.name || 'Unknown Donor'}
																					</span>
																					<span className="text-xs text-gray-500">
																						{response.donor?.phone || 'N/A'}
																					</span>
																					<span className={`px-2 py-0.5 rounded text-xs font-medium ${
														response.status === 'accepted' ? 'bg-green-100 text-green-700' :
														response.status === 'rejected' ? 'bg-red-100 text-red-700' :
														'bg-yellow-100 text-yellow-700'
													}`}>
														{response.status}
													</span>
																				</div>
																				<div className="text-sm text-gray-600">
																					📅 Available: {new Date(response.availableDate).toLocaleDateString()} at {response.availableTime}
																				</div>
																				{response.message && (
																					<div className="text-xs text-gray-500 mt-1 italic">
																						"{response.message}"
																					</div>
																				)}
																			</div>
																		</div>
																	</div>
																))}
															</div>
														</div>
													</td>
												</tr>
											)}
										</>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			)}

			{/* Update Hospital Profile Modal */}
			{showProfileModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
						<h3 className="text-xl font-semibold mb-4">{t('hospital.profile.title')}</h3>
						<form onSubmit={handleProfileSave} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									{t('hospital.profile.name')}
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
									{t('hospital.profile.phone')}
								</label>
								<input
									type="text"
									value={profileForm.phone}
									onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
								/>
							</div>
							<div className="border-t pt-4">
								<h4 className="text-sm font-medium text-gray-700 mb-2">
									{t('hospital.profile.address')}
								</h4>
								<div className="space-y-3">
									<input
										type="text"
										placeholder={t('hospital.profile.street')}
										value={profileForm.address?.street || ''}
										onChange={(e) =>
											setProfileForm({
												...profileForm,
												address: { ...profileForm.address, street: e.target.value }
											})
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
									/>
									<input
										type="text"
										placeholder={t('hospital.profile.district')}
										value={profileForm.address?.area || ''}
										onChange={(e) =>
											setProfileForm({
												...profileForm,
												address: { ...profileForm.address, area: e.target.value }
											})
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
									/>
									<div className="grid grid-cols-2 gap-2">
										<input
											type="text"
											placeholder={t('hospital.profile.city')}
											value={profileForm.address?.city || ''}
											onChange={(e) =>
												setProfileForm({
													...profileForm,
													address: { ...profileForm.address, city: e.target.value }
												})
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
										/>
										<input
											type="text"
											placeholder={t('hospital.profile.state')}
											value={profileForm.address?.state || ''}
											onChange={(e) =>
												setProfileForm({
													...profileForm,
													address: { ...profileForm.address, state: e.target.value }
												})
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
										/>
									</div>
									<input
										type="text"
										placeholder={t('hospital.profile.pincode')}
										value={profileForm.address?.pincode || ''}
										onChange={(e) =>
											setProfileForm({
												...profileForm,
												address: { ...profileForm.address, pincode: e.target.value }
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
									{profileSaving ? '...' : t('hospital.profile.save')}
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

export default HospitalDashboard;
