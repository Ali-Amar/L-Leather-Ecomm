const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  image: {
    type: String,
    required: [true, 'Please add an image']
  },
  itemCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create category slug from name
categorySchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Reverse populate with virtuals
categorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  justOne: false,
  count: true
});

// Update item count when retrieving category
categorySchema.pre(/^find/, async function(next) {
  this.populate('products');
  next();
});

// Update item count after populating
categorySchema.post(/^find/, function(docs) {
  if (!Array.isArray(docs)) {
    docs = [docs];
  }
  
  docs.forEach(doc => {
    if (doc && doc.products) {
      doc.itemCount = doc.products;
    }
  });
});

module.exports = mongoose.model('Category', categorySchema);