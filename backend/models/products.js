import mongoose from 'mongoose';
import Review from './Review.js'; // Important: Register the Review model

const { Schema, model } = mongoose;

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
      enum: ['Bracelets', 'Charms', 'Earrings', 'Rings', 'Necklaces'],
    },
    onSale: {
      type: Boolean,
      default: false,
    },
    images: {
      type: [String],
      required: [true, 'At least one image is required'],
      validate: {
        validator: function (images) {
          return images.length > 0;
        },
        message: 'At least one image is required',
      },
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    sales: {
    type: Number,
    default: 0,
    min: [0, 'Sales count cannot be negative']
  },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, 'Review count cannot be negative'],
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
        ref: 'Review',
      },
    ],
  },
  {
    timestamps: true,
  }
);

productSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Product = model('Product', productSchema);

export default Product;
