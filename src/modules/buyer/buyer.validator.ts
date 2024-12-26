export const validateBuyerCreation = (data: {
  name: string;
  email: string;
  country: string;
  city: string;
  zipCode: string;
  addressBuyer?: string;
  phoneNumber?: string;
  companyName?: string;
  notes?: string;
}) => {
  const errors: string[] = [];

  if (!data.name) {
    errors.push('Name is required');
  }
  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Invalid email format');
  }
  if (!data.country) {
    errors.push('Country is required');
  }
  if (!data.city) {
    errors.push('City is required');
  }
  if (!data.zipCode) {
    errors.push('Zip code is required');
  }

  return errors;
};

export const validateBuyerUpdate = (data: {
  name?: string;
  email?: string;
  country?: string;
  city?: string;
  zipCode?: string;
  addressBuyer?: string;
  phoneNumber?: string;
  companyName?: string;
  notes?: string;
}) => {
  const errors: string[] = [];

  if (data.name?.trim() === '') {
    errors.push('Name cannot be empty');
  }
  if (data.email?.trim() === '') {
    errors.push('Email cannot be empty');
  }
  if (data.email && !isValidEmail(data.email)) {
    errors.push('Invalid email format');
  }
  if (data.country && data.country.trim() === '') {
    errors.push('Country cannot be empty');
  }
  if (data.city && data.city.trim() === '') {
    errors.push('City cannot be empty');
  }
  if (data.zipCode && data.zipCode.trim() === '') {
    errors.push('Zip code cannot be empty');
  }

  return errors;
};

// Helper function for email validation
function isValidEmail(email: string): boolean {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}
