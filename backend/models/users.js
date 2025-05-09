import mongoose from 'mongoose';
import bcrypt from 'bcrypt'; // Static import of bcrypt

const { Schema, model } = mongoose;

// Define the user schema
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Exclude password from query results by default
    },
    phone: {
      type: String,
      match: [
        /^\+?[0-9]{10,15}$/,
        'Please provide a valid phone number (e.g., +251912345678)',
      ],
      required: false, // Optional
    },
    address: {
      type: String,
      minlength: [5, 'Address must be at least 5 characters long'],
      maxlength: [200, 'Address cannot exceed 200 characters'],
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    joined: {
      type: Date,
      default: Date.now,
    },
    cart: {
      items: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
            min: 1,
          },
        },
      ],
      total: {
        type: Number,
        default: 0,
      },
    },
    // Wishlist integrated into user
    wishlist: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
      },
    ],
    // Reviews written by the user
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Middleware to hash password before saving (if the password is modified)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10); // Hashing the password
  this.password = await bcrypt.hash(this.password, salt); // Hash the password
  next();
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password); // Compare password hashes
};

// Create and export the User model
const User = model('User', userSchema);

export default User;
