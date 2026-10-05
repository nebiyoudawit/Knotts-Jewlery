import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB Connected...');

    // Email became optional: rebuild the users email index as sparse so many
    // accounts can exist without one. Safe to run on every start.
    const { default: User } = await import('../models/users.js');
    await User.syncIndexes().catch((err) => console.error('User index sync failed:', err.message));
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
};

export default connectDB;
