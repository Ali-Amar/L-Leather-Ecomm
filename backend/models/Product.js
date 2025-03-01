const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Wallets', 'Cardholders']
  },
  images: {
    type: [String],
    required: [true, 'Please add at least one image'],
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'Please add at least one image'
    }
  },
  stock: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    min: [0, 'Stock cannot be negative']
  },
  stockThreshold: {
    type: Number,
    required: [true, 'Please add stock threshold for low stock alerts'],
    min: [0, 'Stock threshold cannot be negative']
  },
  colors: {
    type: [String],
    required: [true, 'Please add available colors'],
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'Please add at least one color'
    }
  },
  status: {
    type: String,
    enum: ['active', 'draft', 'archived'],
    default: 'active'
  },
  rating: {
    type: Number,
    min: [0, 'Rating cannot be below 0'],
    max: [5, 'Rating cannot be above 5'],
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create product slug from name
productSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Cascade delete reviews when a product is deleted
productSchema.pre('remove', async function(next) {
  await this.model('Review').deleteMany({ product: this._id });
  next();
});

// Reverse populate with virtuals
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
  justOne: false
});

module.exports = mongoose.model('Product', productSchema);