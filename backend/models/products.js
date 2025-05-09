import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Define the product schema
const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      minlength: [3, 'Product name must be at least 3 characters long'],
      maxlength: [100, 'Product name cannot exceed 100 characters'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Product price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative'],
      validate: {
        validator(value) {
          return value === null || value >= this.price;
        },
        message: 'Original price must be equal to or greater than the price',
      },
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Bracelets', 'Charms', 'Earrings', 'Rings', 'Necklaces'],
        message: '{VALUE} is not a valid category',
      },
    },
    onSale: {
      type: Boolean,
      default: false,
    },
    images: {
      type: [String], // Array of strings
      required: [true, 'At least one image is required'],
      validate: {
        validator: function(images) {
          return images.length > 0;
        },
        message: 'At least one image is required'
      }
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5'],
    },
    reviews: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Review', // Linking to the Review model
        },
      ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically manage `createdAt` and `updatedAt`
  }
);

// Middleware to update the `updatedAt` field before saving
productSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create and export the Product model
const Product = model('Product', productSchema);

export default Product;