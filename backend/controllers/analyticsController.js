const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get basic dashboard stats
// @route   GET /api/v1/analytics/dashboard
// @access  Private/Admin
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  // Get today's date and start of current month
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));

  // Get total orders count
  const totalOrders = await Order.countDocuments();

  // Get today's orders
  const todayOrders = await Order.countDocuments({
    createdAt: { $gte: startOfDay }
  });

  // Get revenue stats
  const revenueStats = await Order.aggregate([
    {
      $match: {
        status: { $nin: ['cancelled', 'returned'] }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$total' }
      }
    }
  ]);

  // Get monthly revenue
  const monthlyRevenue = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfMonth },
        status: { $nin: ['cancelled', 'returned'] }
      }
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$total' }
      }
    }
  ]);

  // Get today's revenue
  const todayRevenue = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfDay },
        status: { $nin: ['cancelled', 'returned'] }
      }
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$total' }
      }
    }
  ]);

  // Get order status counts
  const orderStatusCounts = await Order.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get low stock products count
  const lowStockCount = await Product.countDocuments({
    $expr: {
      $lte: ['$stock', '$stockThreshold']
    }
  });

  // Get total customers count
  const totalCustomers = await User.countDocuments({ role: 'user' });

  // Get new customers this month
  const newCustomers = await User.countDocuments({
    role: 'user',
    createdAt: { $gte: startOfMonth }
  });

  // Format response
  const stats = {
    orders: {
      total: totalOrders,
      today: todayOrders,
      statusDistribution: Object.fromEntries(
        orderStatusCounts.map(({ _id, count }) => [_id, count])
      )
    },
    revenue: {
      total: revenueStats[0]?.totalRevenue || 0,
      monthly: monthlyRevenue[0]?.revenue || 0,
      today: todayRevenue[0]?.revenue || 0
    },
    products: {
      lowStock: lowStockCount
    },
    customers: {
      total: totalCustomers,
      newThisMonth: newCustomers
    }
  };

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Get sales analytics
// @route   GET /api/v1/analytics/sales
// @access  Private/Admin
exports.getSalesAnalytics = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;

  // Validate dates
  const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
  const end = endDate ? new Date(endDate) : new Date();

  // Define group format based on groupBy parameter
  let dateFormat;
  switch (groupBy) {
    case 'month':
      dateFormat = '%Y-%m';
      break;
    case 'week':
      dateFormat = '%Y-W%V';
      break;
    case 'day':
    default:
      dateFormat = '%Y-%m-%d';
  }

  // Get sales data grouped by specified interval
  const salesData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: { $nin: ['cancelled', 'returned'] }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: dateFormat, date: '$createdAt' } }
        },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
        avgOrderValue: { $avg: '$total' }
      }
    },
    {
      $sort: { '_id.date': 1 }
    }
  ]);

  // Get category-wise sales
  const categorySales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: { $nin: ['cancelled', 'returned'] }
      }
    },
    {
      $unwind: '$items'
    },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $group: {
        _id: { $arrayElemAt: ['$product.category', 0] },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        count: { $sum: '$items.quantity' }
      }
    },
    {
      $sort: { revenue: -1 }
    }
  ]);

  // Get payment method distribution
  const paymentMethodStats = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: { $nin: ['cancelled', 'returned'] }
      }
    },
    {
      $group: {
        _id: '$paymentMethod',
        count: { $sum: 1 },
        revenue: { $sum: '$total' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      salesData,
      categorySales,
      paymentMethodStats
    }
  });
});

// @desc    Get product analytics
// @route   GET /api/v1/analytics/products
// @access  Private/Admin
exports.getProductAnalytics = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  // Default to last 30 days if no dates provided
  const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
  const end = endDate ? new Date(endDate) : new Date();

  // Get top selling products
  const topSellingProducts = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: { $nin: ['cancelled', 'returned'] }
      }
    },
    {
      $unwind: '$items'
    },
    {
      $group: {
        _id: '$items.product',
        totalSold: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        orders: { $addToSet: '$_id' }
      }
    },
    {
      $addFields: {
        orderCount: { $size: '$orders' }
      }
    },
    {
      $sort: { totalSold: -1 }
    },
    {
      $limit: 10
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $project: {
        _id: 1,
        totalSold: 1,
        revenue: 1,
        orderCount: 1,
        name: { $arrayElemAt: ['$product.name', 0] },
        category: { $arrayElemAt: ['$product.category', 0] },
        stock: { $arrayElemAt: ['$product.stock', 0] }
      }
    }
  ]);

  // Get low stock products
  const lowStockProducts = await Product.find({
    $expr: {
      $lte: ['$stock', '$stockThreshold']
    }
  })
  .select('name category stock stockThreshold price')
  .sort('stock');

  // Get product category distribution
  const categoryDistribution = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Get products out of stock
  const outOfStockCount = await Product.countDocuments({ stock: 0 });

  res.status(200).json({
    success: true,
    data: {
      topSellingProducts,
      lowStockProducts,
      categoryDistribution,
      outOfStockCount
    }
  });
});

// @desc    Get customer analytics
// @route   GET /api/v1/analytics/customers
// @access  Private/Admin
exports.getCustomerAnalytics = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  // Default to last 30 days if no dates provided
  const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
  const end = endDate ? new Date(endDate) : new Date();

  // Get top customers by order value
  const topCustomers = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: { $nin: ['cancelled', 'returned'] }
      }
    },
    {
      $group: {
        _id: '$user',
        totalSpent: { $sum: '$total' },
        orderCount: { $sum: 1 },
        averageOrderValue: { $avg: '$total' },
        lastOrder: { $max: '$createdAt' }
      }
    },
    {
      $sort: { totalSpent: -1 }
    },
    {
      $limit: 10
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $project: {
        _id: 1,
        totalSpent: 1,
        orderCount: 1,
        averageOrderValue: 1,
        lastOrder: 1,
        firstName: { $arrayElemAt: ['$user.firstName', 0] },
        lastName: { $arrayElemAt: ['$user.lastName', 0] },
        email: { $arrayElemAt: ['$user.email', 0] }
      }
    }
  ]);

  // Get customer registration trends
  const registrationTrends = await User.aggregate([
    {
      $match: {
        role: 'user',
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.date': 1 }
    }
  ]);

  // Get customer order frequency distribution
  const orderFrequency = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: { $nin: ['cancelled', 'returned'] }
      }
    },
    {
      $group: {
        _id: '$user',
        orderCount: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$orderCount',
        customerCount: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      topCustomers,
      registrationTrends,
      orderFrequency
    }
  });
});