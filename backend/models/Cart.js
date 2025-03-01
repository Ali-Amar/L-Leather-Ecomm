const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [{
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity cannot be less than 1']
    }
  }],
  total: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate total whenever items are modified
cartSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.total = this.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  } else {
    this.total = 0;
  }
  next();
});

// Populate product details when finding cart
cartSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'items.product',
    select: 'stock'
  });
  next();
});

// Validate stock availability
cartSchema.methods.validateStock = async function() {
  const invalidItems = [];
  
  for (const item of this.items) {
    if (item.product && item.quantity > item.product.stock) {
      invalidItems.push({
        name: item.name,
        requested: item.quantity,
        available: item.product.stock
      });
    }
  }
  
  return invalidItems;
};

module.exports = mongoose.model('Cart', cartSchema);