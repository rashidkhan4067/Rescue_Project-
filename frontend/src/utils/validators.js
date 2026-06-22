/**
 * Professional frontend validation utilities
 */

export const validateEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
};

export const validatePassword = (password) => {
  // At least 6 characters
  return password && password.length >= 6;
};

export const validateUsername = (username) => {
  // Alphanumeric and underscores, between 3 and 20 characters
  const re = /^[a-zA-Z0-9_]{3,20}$/;
  return re.test(username);
};
