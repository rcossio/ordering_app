const mongoose = require('mongoose');

// User Schema with embedded categories, dishes, ingredients, and orders
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  language: { type: String, default: 'en' },
  categories: [{
    name: { type: String, required: true, unique: true },
  }],
  dishes: [{
    name: { type: String, required: true },
    category: { type: String, required: true }, // Reference category by name
    image: { type: String },
    ingredients: [{
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
    }],
    price: { type: Number, required: true },
  }],
  ingredients: [{
    name: {
      default: { type: String, required: true },
      en: { type: String },
      it: { type: String },
    },
    unit: { type: String, enum: ['g', 'kg', 'unit', 'slice', 'general'], required: true },
    price: { type: Number, required: true },
  }],
  orders: [{
    dishes: [{
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
    }],
    total: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tip: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  }],
});

const User = mongoose.model('User', userSchema);

module.exports = { User };