import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Star, MessageCircle, User } from 'lucide-react';
import { selectUser } from '../../features/auth/authSlice';
import Button from '../common/Button';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ProductReviews = ({ productId }) => {
  const user = useSelector(selectUser);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    text: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/products/${productId}/reviews`);
      setReviews(response.data);
    } catch (error) {
      setError(error?.message || 'Failed to load reviews');
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.post(`/products/${productId}/reviews`, reviewForm);
      setReviews(prev => [response.data, ...prev]);
      setIsModalOpen(false);
      setReviewForm({ rating: 5, title: '', text: '' });
      toast.success('Review submitted successfully');
    } catch (error) {
      toast.error(error?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const ReviewForm = () => (
    <form onSubmit={handleSubmitReview} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rating
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
              className="focus:outline-none"
            >
              <Star
                className={`w-6 h-6 ${
                  star <= reviewForm.rating
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={reviewForm.title}
          onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          placeholder="Summarize your review"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Review
        </label>
        <textarea
          value={reviewForm.text}
          onChange={(e) => setReviewForm(prev => ({ ...prev, text: e.target.value }))}
          rows={4}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          placeholder="Share your experience with this product"
          required
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsModalOpen(false)}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </div>
    </form>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button
          variant="outline"
          onClick={fetchReviews}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Reviews Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-gray-900">
          Customer Reviews ({reviews.length})
        </h2>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          Write a Review
        </Button>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No reviews yet</p>
          <p className="text-sm text-gray-400">Be the first to review this product</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-200 pb-6">
              <div className="flex items-start">
                {/* User Avatar */}
                <div className="flex-shrink-0 mr-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                </div>

                {/* Review Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {review.user.firstName} {review.user.lastName}
                      </h4>
                      <div className="flex items-center mt-1">
                        {/* Star Rating */}
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>

                  <h5 className="mt-2 text-sm font-medium text-gray-900">
                    {review.title}
                  </h5>
                  <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">
                    {review.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Write a Review"
      >
        <ReviewForm />
      </Modal>
    </div>
  );
};

export default ProductReviews;