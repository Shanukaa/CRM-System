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
export const USER_TYPES = ['admin', 'employee'];
export const FAT_CONTOURING_DEFAULT_VISIBLE = [
  'full_name',
  'phone_number',
  'city',
  'which_area_would_you_like_to_discuss_for_body_contouring?',
  'what_would_you_mainly_like_to_learn_more_about?',
];
export const FAT_CONTOURING_EDITABLE = ['1st Status', '2nd Status'];

export const BODY_FILLERS_DEFAULT_VISIBLE = [
  'full_name',
  'phone_number',
  'city',
  'which_filler_treatment_are_you_interested_in?',
  'platform',
];
export const BODY_FILLERS_EDITABLE = ['Note', 'Staff', 'Call 01', 'Call 02', 'Call 03'];
export const BODY_FILLERS_CHECKBOX_FIELDS = ['Call 01', 'Call 02', 'Call 03'];

export const FAT_CONTOURING_COLUMNS = [
  { key: 'full_name', label: 'Full Name' },
  { key: 'phone_number', label: 'Phone Number' },
  { key: 'created_time', label: 'Created Time' },
  { key: 'ad_id', label: 'Ad ID' },
  { key: 'ad_name', label: 'Ad Name' },
  { key: 'adset_id', label: 'Adset ID' },
  { key: 'adset_name', label: 'Adset Name' },
  { key: 'campaign_id', label: 'Campaign ID' },
  { key: 'campaign_name', label: 'Campaign Name' },
  { key: 'form_id', label: 'Form ID' },
  { key: 'form_name', label: 'Form Name' },
  { key: 'is_organic', label: 'Is Organic' },
  { key: 'platform', label: 'Platform' },
  { key: 'Are_you_18_years_of_age_or_older?', label: '18+? (A)' },
  { key: 'which_area_would_you_like_to_discuss_for_body_contouring?', label: 'Area of Interest' },
  { key: 'what_would_you_mainly_like_to_learn_more_about?', label: 'Wants to Learn About' },
  { key: 'city', label: 'City' },
  { key: 'lead_status', label: 'Lead Status' },
  { key: '1st Status', label: '1st Status' },
  { key: '2nd Status', label: '2nd Status' },
  { key: 'are_you_18_years_of_age_or_older?', label: '18+? (B)' },
];

export const BODY_FILLERS_COLUMNS = [
  { key: 'full_name', label: 'Full Name' },
  { key: 'phone_number', label: 'Phone Number' },
  { key: 'id', label: 'ID' },
  { key: 'created_time', label: 'Created Time' },
  { key: 'ad_id', label: 'Ad ID' },
  { key: 'ad_name', label: 'Ad Name' },
  { key: 'adset_id', label: 'Adset ID' },
  { key: 'adset_name', label: 'Adset Name' },
  { key: 'campaign_id', label: 'Campaign ID' },
  { key: 'campaign_name', label: 'Campaign Name' },
  { key: 'form_id', label: 'Form ID' },
  { key: 'form_name', label: 'Form Name' },
  { key: 'is_organic', label: 'Is Organic' },
  { key: 'platform', label: 'Platform' },
  { key: 'are_you_18_years_of_age_or_older?', label: '18+?' },
  { key: 'which_filler_treatment_are_you_interested_in?', label: 'Filler Treatment Interest' },
  { key: 'what_is_the_best_time_to_contact_you?', label: 'Best Time to Contact' },
  { key: 'city', label: 'City' },
  { key: 'lead_status', label: 'Lead Status' },
  { key: 'Call 01', label: 'Call 01' },
  { key: 'Call 02', label: 'Call 02' },
  { key: 'Call 03', label: 'Call 03' },
  { key: 'Note', label: 'Note' },
  { key: 'Treatment', label: 'Treatment' },
  { key: 'Staff', label: 'Staff' },
];
