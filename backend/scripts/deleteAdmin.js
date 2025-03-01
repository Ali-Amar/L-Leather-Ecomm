const dotenv = require('dotenv');
const colors = require('colors');
const User = require('../models/User');
const connectDB = require('../config/db');

// Load env vars
dotenv.config();

const deleteAdmin = async () => {
  try {
    await connectDB();
    
    // Delete admin user
    const result = await User.deleteOne({ role: 'admin' });
    
    if (result.deletedCount > 0) {
      console.log('Admin user deleted successfully'.green);
    } else {
      console.log('No admin user found'.yellow);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error deleting admin user:'.red, error);
    process.exit(1);
  }
};

deleteAdmin();