import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { User, MapPin, Phone, Mail } from 'lucide-react';
import { selectUser } from '../../features/auth/authSlice';
import Input from '../common/Input';
import Button from '../common/Button';
import { PAKISTAN_REGIONS } from '../../utils/constants';

const ShippingForm = ({ onSubmit, savedData, isSubmitting }) => {
  const user = useSelector(selectUser);
  const [formData, setFormData] = useState(savedData || {
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    postalCode: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.postalCode) {
      newErrors.postalCode = 'Postal code is required';
    } else if (!/^\d{5}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Please enter a valid 5-digit postal code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      // Error handling is managed by parent component
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear city when state changes
    if (name === 'state') {
      setFormData(prev => ({
        ...prev,
        city: ''
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          error={errors.firstName}
          icon={User}
          placeholder="John"
        />
        <Input
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          error={errors.lastName}
          icon={User}
          placeholder="Doe"
        />
      </div>

      <Input
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        icon={Mail}
        placeholder="you@example.com"
      />

      <Input
        label="Phone Number"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        error={errors.phone}
        icon={Phone}
        placeholder="+92 300 1234567"
      />

      <Input
        label="Street Address"
        name="address"
        value={formData.address}
        onChange={handleChange}
        error={errors.address}
        icon={MapPin}
        placeholder="123 Main St"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State/Province
          </label>
          <select
            name="state"
            value={formData.state}
            onChange={handleChange}
            className={`w-full rounded-md shadow-sm ${
              errors.state
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-primary focus:ring-primary'
            }`}
          >
            <option value="">Select State</option>
            {Object.keys(PAKISTAN_REGIONS).map(state => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="mt-1 text-sm text-red-500">{errors.state}</p>
          )}
        </div>

        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <select
            name="city"
            value={formData.city}
            onChange={handleChange}
            disabled={!formData.state}
            className={`w-full rounded-md shadow-sm ${
              errors.city
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-primary focus:ring-primary'
            } ${!formData.state ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          >
            <option value="">Select City</option>
            {formData.state && PAKISTAN_REGIONS[formData.state].map(city => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          {errors.city && (
            <p className="mt-1 text-sm text-red-500">{errors.city}</p>
          )}
        </div>

        <div className="col-span-1">
          <Input
            label="Postal Code"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            error={errors.postalCode}
            placeholder="54000"
          />
        </div>
      </div>

      <Button 
        type="submit"
        fullWidth
        disabled={isSubmitting}
        className="mt-6"
      >
        {isSubmitting ? 'Processing...' : 'Continue to Payment'}
      </Button>

      {formData.city && !errors.city && (
        <p className="text-sm text-gray-600 text-center">
          Delivering to {formData.city}, {formData.state}
        </p>
      )}
    </form>
  );
};

export default ShippingForm;