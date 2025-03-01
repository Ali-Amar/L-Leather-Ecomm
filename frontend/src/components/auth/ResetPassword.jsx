import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { resetPassword, selectAuthLoading, selectAuthError } from '../../features/auth/authSlice';

import Button from '../common/Button';
import Input from '../common/Input';

const ResetPassword = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setValidationError('Please enter your email address');
      return;
    }

    try {
      await dispatch(resetPassword(email)).unwrap();
      setIsSubmitted(true);
    } catch (err) {
      setValidationError('Failed to send reset link. Please try again.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          <div className="rounded-full bg-green-100 w-16 h-16 flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="mt-6 font-serif text-3xl font-bold text-gray-900">Check your email</h2>
          <p className="mt-2 text-sm text-gray-600">
            We have sent a password reset link to{' '}
            <span className="font-medium text-gray-900">{email}</span>
          </p>
          <p className="mt-4 text-sm text-gray-600">
            Didn't receive the email?{' '}
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-primary hover:text-primary-light font-medium"
            >
              Click to try again
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold text-gray-900">Reset your password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setValidationError('');
            }}
            icon={Mail}
            error={validationError || error}
            placeholder="Enter your email"
            autoComplete="email"
          />

          <Button
            type="submit"
            fullWidth
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? 'Sending reset link...' : 'Send reset link'}
          </Button>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-primary hover:text-primary-light"
            >
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;