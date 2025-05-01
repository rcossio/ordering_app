const mongoose = require('mongoose');

// Category Schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

// Dish Schema
const dishSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  image: { type: String },
  ingredients: [{
    ingredient: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
    quantity: { type: Number, required: true }, // in units defined by Ingredient.unit
  }],
  price: { type: Number, required: true },
});

// Ingredient Schema
const ingredientSchema = new mongoose.Schema({
  name: {
    default: { type: String, required: true },
    en: { type: String },
    it: { type: String },
    // Add more languages as needed
  },
  unit: { type: String, enum: ['g', 'kg', 'unit', 'slice', 'general'], required: true },
  price: { type: Number, required: true },
});

// Order Schema
const orderSchema = new mongoose.Schema({
  dishes: [{
    dish: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish' },
    quantity: { type: Number, required: true },
  }],
  total: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tip: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Add User Schema for language configuration
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  language: { type: String, default: 'en' }, // Default language is English
});

const User = mongoose.model('User', userSchema);
const Category = mongoose.model('Category', categorySchema);
const Dish = mongoose.model('Dish', dishSchema);
const Ingredient = mongoose.model('Ingredient', ingredientSchema);
const Order = mongoose.model('Order', orderSchema);

module.exports = { Category, Dish, Ingredient, Order, User };