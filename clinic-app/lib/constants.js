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
  { key: 'status', label: 'Status' },
  { key: 'created by', label: 'Created By' },
];

export const APPOINTMENT_STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
export const CLIENT_STATUSES = ['Active', 'Inactive'];
export const GENDERS = ['Male', 'Female', 'Other'];
export const PLATFORMS = ['Walk-in', 'Phone Call', 'Website', 'Social Media', 'Referral', 'Other'];
export const USER_TYPES = ['admin', 'employee'];
