// Validation utility functions

// Email validation
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

// Phone number validation - accepts various formats
export const validatePhone = (phone) => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Check if it's a valid phone number (9-12 digits)
  // This handles formats like:
  // 0712345678, +254712345678, 254712345678, 07-1234-5678
  return digits.length >= 9 && digits.length <= 12;
};

// Password validation - at least 6 characters
export const validatePassword = (password) => {
  return password.length >= 6;
};

// Password strength check
export const getPasswordStrength = (password) => {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.match(/[a-z]+/)) strength++;
  if (password.match(/[A-Z]+/)) strength++;
  if (password.match(/[0-9]+/)) strength++;
  if (password.match(/[$@#&!]+/)) strength++;
  
  return {
    score: strength,
    label: strength <= 2 ? 'Weak' : strength <= 4 ? 'Medium' : 'Strong',
    color: strength <= 2 ? '#d32f2f' : strength <= 4 ? '#f57c00' : '#388e3c'
  };
};

// Name validation - letters, spaces, and hyphens only
export const validateName = (name) => {
  const re = /^[a-zA-Z\s-']+$/;
  return re.test(name) && name.length >= 2;
};

// Land size validation
export const validateLandSize = (size) => {
  const num = parseFloat(size);
  return !isNaN(num) && num > 0 && num < 1000; // Max 1000 acres
};

// Date validation - cannot be in the future
export const validatePlantingDate = (date) => {
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return selectedDate <= today;
};

// Required field validation
export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

// Numeric validation
export const validateNumber = (value, min = 0, max = Infinity) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
};

// Format phone number for display
export const formatPhoneNumber = (phone) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  } else if (digits.length === 12) {
    return '+' + digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
  }
  return phone;
};

// Error message helper
export const getErrorMessage = (field, errorType) => {
  const messages = {
    email: {
      required: 'Email is required',
      invalid: 'Please enter a valid email address'
    },
    phone: {
      required: 'Phone number is required',
      invalid: 'Please enter a valid phone number (9-12 digits)'
    },
    password: {
      required: 'Password is required',
      weak: 'Password must be at least 6 characters',
      mismatch: 'Passwords do not match'
    },
    name: {
      required: 'Full name is required',
      invalid: 'Name can only contain letters, spaces, and hyphens'
    },
    landSize: {
      required: 'Land size is required',
      invalid: 'Please enter a valid land size (0.1 - 1000 acres)'
    },
    plantingDate: {
      required: 'Planting date is required',
      invalid: 'Planting date cannot be in the future'
    },
    cropType: {
      required: 'Please select a crop type'
    },
    location: {
      required: 'Please select a location on the map'
    }
  };

  return messages[field]?.[errorType] || 'Invalid input';
};