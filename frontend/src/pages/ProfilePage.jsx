import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { User, Mail, Phone, Lock } from 'lucide-react';
import {
  selectUser,
  selectAuthLoading,
  updateProfile,
  deleteAccount
} from '../features/auth/authSlice';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectAuthLoading);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
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

    // Only validate password fields if any password field is filled
    if (formData.currentPassword || formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }
      if (!formData.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your new password';
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const updateData = {
        userData: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      };

      await dispatch(updateProfile(updateData)).unwrap();
      setIsEditing(false);
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      setErrors({
        submit: error || 'Failed to update profile'
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await dispatch(deleteAccount()).unwrap();
        navigate('/');
      } catch (error) {
        setErrors({
          submit: 'Failed to delete account'
        });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-serif font-bold text-gray-900">Profile Settings</h1>
            <Button
              variant={isEditing ? "outline" : "primary"}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                icon={User}
                disabled={!isEditing}
              />

              <Input
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                icon={User}
                disabled={!isEditing}
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
              disabled={!isEditing}
            />

            <Input
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              icon={Phone}
              disabled={!isEditing}
            />
          </div>

          {/* Password Change Section */}
          {isEditing && (
            <div className="space-y-6 pt-6 border-t border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Change Password</h2>
              <p className="text-sm text-gray-500">Leave blank if you don't want to change your password</p>
              
              <Input
                label="Current Password"
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                error={errors.currentPassword}
                icon={Lock}
              />

              <Input
                label="New Password"
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                error={errors.newPassword}
                icon={Lock}
              />

              <Input
                label="Confirm New Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                icon={Lock}
              />
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="text-sm text-red-500 text-center">
              {errors.submit}
            </div>
          )}

          {/* Action Buttons */}
          {isEditing && (
            <div className="pt-6 border-t border-gray-200">
              <div className="flex flex-col space-y-4">
                <Button 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving Changes...' : 'Save Changes'}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="text-red-600 hover:bg-red-50 border-red-600"
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;