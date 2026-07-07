// Application constants

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const PRIORITY_LEVELS = ['Critical', 'Urgent', 'Regular'];

export const REQUEST_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

export const USER_ROLES = {
  DONOR: 'donor',
  HOSPITAL: 'hospital',
  BLOOD_BANK: 'bloodbank'
};

export const DONATION_ELIGIBILITY_DAYS = 90; // 3 months

export const BLOOD_UNIT_EXPIRY_DAYS = 42; // 6 weeks for whole blood

export const MIN_DONATION_AGE = 18;
export const MAX_DONATION_AGE = 65;
export const MIN_WEIGHT_KG = 50;

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    PROFILE: '/auth/me',
    UPDATE_PROFILE: '/auth/profile'
  },
  DONOR: {
    REQUESTS: '/donor/requests',
    RESPOND: (id) => `/donor/requests/${id}/respond`,
    HISTORY: '/donor/history',
    STATS: '/donor/stats',
    RECORD_DONATION: '/donor/donation'
  },
  HOSPITAL: {
    CREATE_REQUEST: '/hospital/requests',
    GET_REQUESTS: '/hospital/requests',
    UPDATE_REQUEST: (id) => `/hospital/requests/${id}`,
    INVENTORY: '/hospital/inventory',
    STATS: '/hospital/stats',
    SEARCH_DONORS: '/hospital/donors/search'
  },
  BLOOD_BANK: {
    INVENTORY: '/bloodbank/inventory',
    ADD_UNIT: '/bloodbank/inventory/add',
    UPDATE_TESTS: '/bloodbank/inventory/unit/tests',
    REQUESTS: '/bloodbank/requests',
    PROCESS_REQUEST: (id) => `/bloodbank/requests/${id}/process`,
    COMPLETE_REQUEST: (id) => `/bloodbank/requests/${id}/complete`,
    PENDING_DONORS: '/bloodbank/donors/pending',
    VERIFY_DONOR: (id) => `/bloodbank/donors/${id}/verify`,
    STATS: '/bloodbank/stats'
  }
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Unauthorized. Please login again.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.'
};

export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  REGISTER: 'Registration successful!',
  PROFILE_UPDATE: 'Profile updated successfully!',
  REQUEST_CREATED: 'Blood request created successfully!',
  REQUEST_UPDATED: 'Request updated successfully!',
  DONATION_RECORDED: 'Donation recorded successfully!',
  DONOR_VERIFIED: 'Donor verified successfully!',
  BLOOD_UNIT_ADDED: 'Blood unit added to inventory!',
  REQUEST_PROCESSED: 'Request is being processed!'
};

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme'
};

export const BLOOD_TYPE_INFO = {
  'O-': { 
    name: 'O Negative',
    canDonateTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-'],
    description: 'Universal donor'
  },
  'O+': {
    name: 'O Positive',
    canDonateTo: ['O+', 'A+', 'B+', 'AB+'],
    canReceiveFrom: ['O-', 'O+'],
    description: 'Most common blood type'
  },
  'A-': {
    name: 'A Negative',
    canDonateTo: ['A-', 'A+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-', 'A-'],
    description: 'Rare blood type'
  },
  'A+': {
    name: 'A Positive',
    canDonateTo: ['A+', 'AB+'],
    canReceiveFrom: ['O-', 'O+', 'A-', 'A+'],
    description: 'Common blood type'
  },
  'B-': {
    name: 'B Negative',
    canDonateTo: ['B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-', 'B-'],
    description: 'Rare blood type'
  },
  'B+': {
    name: 'B Positive',
    canDonateTo: ['B+', 'AB+'],
    canReceiveFrom: ['O-', 'O+', 'B-', 'B+'],
    description: 'Common blood type'
  },
  'AB-': {
    name: 'AB Negative',
    canDonateTo: ['AB-', 'AB+'],
    canReceiveFrom: ['O-', 'A-', 'B-', 'AB-'],
    description: 'Rarest blood type'
  },
  'AB+': {
    name: 'AB Positive',
    canDonateTo: ['AB+'],
    canReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    description: 'Universal recipient'
  }
};