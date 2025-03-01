const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
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
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    color: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    }
  }],
  shippingAddress: {
    firstName: {
      type: String,
      required: [true, 'Please add a first name']
    },
    lastName: {
      type: String,
      required: [true, 'Please add a last name']
    },
    address: {
      type: String,
      required: [true, 'Please add an address']
    },
    city: {
      type: String,
      required: [true, 'Please add a city']
    },
    state: {
      type: String,
      required: [true, 'Please add a state']
    },
    postalCode: {
      type: String,
      required: [true, 'Please add a postal code']
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number']
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      match: [/^\S+@\S+\.\S+$/, 'Please add a valid email']
    }
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'card'],
    required: [true, 'Please add a payment method']
  },
  paymentDetails: {
    cardLast4: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  shippingFee: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  notes: {
    type: String,
    maxlength: 500
  },
  trackingInfo: {
    carrier: String,
    trackingNumber: String,
    trackingUrl: String
  }
}, {
  timestamps: true
});

// Update product stock after order is placed
orderSchema.post('save', async function() {
  if (this.status === 'pending') {
    const Product = this.model('Product');
    
    for (const item of this.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }
  }
});

// Restore product stock if order is cancelled
orderSchema.pre('save', async function(next) {
  if (this.isModified('status') && this.status === 'cancelled') {
    const previousOrder = await this.constructor.findById(this._id);
    if (previousOrder.status !== 'cancelled') {
      const Product = this.model('Product');
      
      for (const item of this.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }
  }
  next();
});

// Populate user and product details
orderSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'firstName lastName email'
  });
  next();
});

module.exports = mongoose.model('Order', orderSchema);