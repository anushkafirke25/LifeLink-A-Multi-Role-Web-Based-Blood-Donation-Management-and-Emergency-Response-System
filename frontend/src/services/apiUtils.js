// API utility functions for error handling and data formatting

export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    return error.response.data.message || 'Server error occurred';
  } else if (error.request) {
    // Request made but no response
    return 'Network error. Please check your connection.';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return formatDate(dateString);
};

export const calculateEligibility = (lastDonationDate) => {
  if (!lastDonationDate) return { eligible: true, daysLeft: 0 };
  
  const lastDonation = new Date(lastDonationDate);
  const eligibleDate = new Date(lastDonation);
  eligibleDate.setDate(eligibleDate.getDate() + 90); // 90 days = 3 months
  
  const now = new Date();
  const daysLeft = Math.ceil((eligibleDate - now) / (1000 * 60 * 60 * 24));
  
  return {
    eligible: daysLeft <= 0,
    daysLeft: Math.max(0, daysLeft)
  };
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[+]?[\d\s\-()]+$/;
  return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const getBloodTypeCompatibility = (bloodType) => {
  const compatibility = {
    'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'A-': ['A-', 'A+', 'AB-', 'AB+'],
    'A+': ['A+', 'AB+'],
    'B-': ['B-', 'B+', 'AB-', 'AB+'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB-', 'AB+'],
    'AB+': ['AB+']
  };
  
  return compatibility[bloodType] || [];
};

export const getPriorityColor = (priority) => {
  const colors = {
    'Critical': 'bg-red-100 text-red-600 border-red-600',
    'Urgent': 'bg-orange-100 text-orange-600 border-orange-600',
    'Regular': 'bg-blue-100 text-blue-600 border-blue-600'
  };
  return colors[priority] || 'bg-gray-100 text-gray-600 border-gray-600';
};

export const getStatusColor = (status) => {
  const colors = {
    'Pending': 'bg-yellow-100 text-yellow-600',
    'Approved': 'bg-blue-100 text-blue-600',
    'Processing': 'bg-purple-100 text-purple-600',
    'Completed': 'bg-green-100 text-green-600',
    'Cancelled': 'bg-red-100 text-red-600',
    'Rejected': 'bg-gray-100 text-gray-600'
  };
  return colors[status] || 'bg-gray-100 text-gray-600';
};

export const formatUnits = (units) => {
  return `${units} ${units === 1 ? 'unit' : 'units'}`;
};

export const getInventoryStatus = (units, thresholds = { low: 10, critical: 5 }) => {
  if (units <= thresholds.critical) return 'critical';
  if (units <= thresholds.low) return 'low';
  return 'good';
};

export const getInventoryColor = (status) => {
  const colors = {
    'good': 'bg-green-100 border-green-500 text-green-900',
    'low': 'bg-yellow-100 border-yellow-500 text-yellow-900',
    'critical': 'bg-red-100 border-red-500 text-red-900'
  };
  return colors[status] || 'bg-gray-100 border-gray-500 text-gray-900';
};