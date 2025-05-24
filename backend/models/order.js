import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Define the order schema
const orderSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'], // Link to the User model
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: [true, 'Product is required'],
        },
        name: {
          type: String,
          required: [true, 'Product name is required'],
        },
        quantity: {
          type: Number,
          required: [true, 'Quantity is required'],
          min: [1, 'Quantity cannot be less than 1'],
        },
        price: {
          type: Number,
          required: [true, 'Price is required'],
          min: [0, 'Price cannot be negative'],
        },
      },
    ],
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total cannot be negative'],
    },
    shippingAddress: {
      type: String,
      required: [true, 'Shipping address is required'],
    },
    paymentMethod: {
      type: String,
      enum: ['Pay on Delivery'],
      default: 'Pay on Delivery', // Default to 'Pay on Delivery'
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid'],
      default: 'Pending', // Payment status defaults to 'Pending'
    },
    status: {
      type: String,
      enum: ['Pending', 'Delivered', 'Cancelled'],
      default: 'Pending', // Order status defaults to 'Pending'
    },
    deliveryDate: {
      type: Date,
      default: function() {
        const now = new Date();
        now.setDate(now.getDate() + 7); // Add 7 days to the current date
        return now; // Set the delivery date to be 7 days from now
      },
    },
    createdAt: {
      type: Date,
      default: Date.now, // Order creation timestamp
    },
    updatedAt: {
      type: Date,
      default: Date.now, // Order update timestamp
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Middleware to update the `updatedAt` field before saving
orderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create and export the Order model
const Order = model('Order', orderSchema);

export default Order;
