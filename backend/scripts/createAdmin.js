const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('../models/User');
const connectDB = require('../config/db');

// Load env vars
dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();
    
    // First check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists'.yellow);
      process.exit(0);
    }

    // Admin credentials
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@lardeneleather.com',
      password: 'admin123',  // Will be hashed by the User model pre-save hook
      phone: '1234567890',
      role: 'admin'
    };

    // Create the admin user in database
    const admin = await User.create(adminData);

    if (admin) {
      console.log('Admin user created successfully:'.green);
      console.log('Email:'.cyan, adminData.email);
      console.log('Password:'.cyan, 'admin123');
      console.log('Please save these credentials and change the password after first login'.yellow);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:'.red, error);
    process.exit(1);
  }
};

createAdmin();