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
    ingredient: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' },
    quantity: { type: String },
  }],
});

// Ingredient Schema
const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
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

const Category = mongoose.model('Category', categorySchema);
const Dish = mongoose.model('Dish', dishSchema);
const Ingredient = mongoose.model('Ingredient', ingredientSchema);
const Order = mongoose.model('Order', orderSchema);

module.exports = { Category, Dish, Ingredient, Order };