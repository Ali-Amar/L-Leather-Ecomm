// Email validation
export const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  // Phone number validation
  export const isValidPhone = (phone) => {
    const re = /^\+?[\d\s-]{10,}$/;
    return re.test(phone);
  };
  
  // Password validation
  export const isValidPassword = (password) => {
    return password.length >= 6;
  };
  
  // Form validation schemas
  export const validateLoginForm = (values) => {
    const errors = {};
    
    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(values.email)) {
      errors.email = 'Invalid email format';
    }
  
    if (!values.password) {
      errors.password = 'Password is required';
    }
  
    return errors;
  };
  
  export const validateRegisterForm = (values) => {
    const errors = {};
  
    if (!values.firstName) errors.firstName = 'First name is required';
    if (!values.lastName) errors.lastName = 'Last name is required';
    
    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(values.email)) {
      errors.email = 'Invalid email format';
    }
  
    if (!values.phone) {
      errors.phone = 'Phone number is required';
    } else if (!isValidPhone(values.phone)) {
      errors.phone = 'Invalid phone number';
    }
  
    if (!values.password) {
      errors.password = 'Password is required';
    } else if (!isValidPassword(values.password)) {
      errors.password = 'Password must be at least 6 characters';
    }
  
    if (!values.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
  
    return errors;
  };
  
  export const validateShippingForm = (values) => {
    const errors = {};
  
    if (!values.firstName) errors.firstName = 'First name is required';
    if (!values.lastName) errors.lastName = 'Last name is required';
    if (!values.address) errors.address = 'Address is required';
    if (!values.city) errors.city = 'City is required';
    if (!values.phone) {
      errors.phone = 'Phone number is required';
    } else if (!isValidPhone(values.phone)) {
      errors.phone = 'Invalid phone number';
    }
    if (!values.postalCode) errors.postalCode = 'Postal code is required';
  
    return errors;
  };
  
  export const validateProductForm = (values) => {
    const errors = {};
  
    if (!values.name) errors.name = 'Product name is required';
    if (!values.description) errors.description = 'Description is required';
    if (!values.price) {
      errors.price = 'Price is required';
    } else if (isNaN(values.price) || values.price <= 0) {
      errors.price = 'Price must be a positive number';
    }
    if (!values.category) errors.category = 'Category is required';
    if (!values.stock) errors.stock = 'Stock quantity is required';
    if (!values.colors || values.colors.length === 0) {
      errors.colors = 'At least one color must be selected';
    }
    if (!values.images || values.images.length === 0) {
      errors.images = 'At least one image is required';
    }
  
    return errors;
  };