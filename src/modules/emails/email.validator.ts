// email.validator.ts

// Function to validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailRegex.test(email);
};

// Minimum length validation for subject, text, and HTML
export const hasValidLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

// Function to validate that parameters are not empty
export const isNotEmpty = (value: string | undefined): boolean => {
  return value?.trim() !== ''; // Ensure the value is not undefined or empty
};

// Validation to ensure HTML content is not empty
export const isValidHtmlContent = (html: string): boolean => {
  return html?.trim().length > 10; // Must have at least 10 characters
};

// Validation that the bulk email list is not empty and contains valid emails
export const isValidBulkEmails = (to: string[]): boolean => {
  return to.length > 0 && to.every(isValidEmail);
};

// Validation that the sender email is valid
export const isValidSenderEmail = (sender: any): boolean => {
  return sender && isValidEmail(sender);
};

// Validation that the subject has a minimum length
export const isValidSubject = (subject: string | undefined): boolean => {
  return subject ? hasValidLength(subject, 5) : false; // Subject must be at least 5 characters
};

// Validation messages for errors
export const validationMessages = {
  invalidEmail: 'Invalid email format for recipient',
  invalidSenderEmail: 'Invalid sender email format',
  missingField: 'Field is missing or undefined: ',
  emptyContent: 'Subject, text, and HTML content are required',
  invalidSubject: 'Subject must have at least 5 characters',
  invalidHtmlContent: 'HTML content must have at least 10 characters',
  invalidBulkEmails: 'Invalid or empty recipient list',
};
