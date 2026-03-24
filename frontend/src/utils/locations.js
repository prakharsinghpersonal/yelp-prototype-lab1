export const COUNTRY_CODES = {
  'United States': '+1',
  'Canada': '+1',
  'United Kingdom': '+44',
  'India': '+91',
  'Australia': '+61',
  'Germany': '+49',
  'France': '+33',
  'Japan': '+81',
  'China': '+86',
  'Mexico': '+52',
  'Brazil': '+55',
  'Other': ''
};

export const STATES_BY_COUNTRY = {
  'United States': [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ],
  'Canada': [
    'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 
    'QC', 'SK', 'YT'
  ],
  'Australia': [
    'NSW', 'QLD', 'SA', 'TAS', 'VIC', 'WA', 'ACT', 'NT'
  ]
};

export const COUNTRIES = Object.keys(COUNTRY_CODES);
