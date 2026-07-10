export const CLIENT_COLUMNS = [
  { key: 'client name', label: 'Client Name' },
  { key: 'phone', label: 'Phone' },
  { key: 'gender', label: 'Gender' },
  { key: 'language', label: 'Language' },
  { key: 'platform', label: 'Registered Platform' },
  { key: 'created at', label: 'Created At' },
  { key: 'status', label: 'Status' },
];

export const APPOINTMENT_COLUMNS = [
  { key: 'appointment number', label: 'Appointment #' },
  { key: 'client name', label: 'Client Name' },
  { key: 'treatment name', label: 'Treatment' },
  { key: 'phone number', label: 'Phone Number' },
  { key: 'preferred date', label: 'Preferred Date' },
  { key: 'preferred time', label: 'Preferred Time' },
  { key: 'platform', label: 'Booked Via' },
  { key: 'status', label: 'Status' },
  { key: 'created by', label: 'Created By' },
];

export const APPOINTMENT_STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
export const CLIENT_STATUSES = ['Active', 'Inactive'];
export const GENDERS = ['Male', 'Female', 'Other'];
export const PLATFORMS = ['Walk-in', 'Phone Call', 'Website', 'Social Media', 'Referral', 'Other'];
export const COUNTRY_CODES = [
  { code: '+94', country: 'Sri Lanka' },
  { code: '+91', country: 'India' },
  { code: '+1', country: 'US / Canada' },
  { code: '+44', country: 'United Kingdom' },
  { code: '+61', country: 'Australia' },
  { code: '+65', country: 'Singapore' },
  { code: '+971', country: 'UAE' },
  { code: '+966', country: 'Saudi Arabia' },
  { code: '+974', country: 'Qatar' },
  { code: '+92', country: 'Pakistan' },
  { code: '+880', country: 'Bangladesh' },
  { code: '+60', country: 'Malaysia' },
  { code: '+63', country: 'Philippines' },
  { code: '+81', country: 'Japan' },
  { code: '+86', country: 'China' },
  { code: '+49', country: 'Germany' },
  { code: '+33', country: 'France' },
  { code: '+39', country: 'Italy' },
  { code: '+34', country: 'Spain' },
  { code: '+27', country: 'South Africa' },
  { code: '+64', country: 'New Zealand' },
];

export const USER_TYPES = ['admin', 'employee'];
