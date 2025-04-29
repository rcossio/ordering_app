const express = require('express');
const router = express.Router();
const { Category, Dish, Order } = require('./models');

// Example route
router.get('/', (req, res) => {
    console.log('API is working');
  res.send('API is working');
});

// Fetch all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    console.log('Fetched categories:', categories);
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Fetch all dishes in a category
router.get('/categories/:categoryId/dishes', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const dishes = await Dish.find({ category: categoryId });
    res.json(dishes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dishes' });
  }
});

// Create a new dish
router.post('/dishes', async (req, res) => {
  try {
    const { name, category, price } = req.body;
    const newDish = new Dish({ name, category, price });
    await newDish.save();
    res.status(201).json(newDish);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create dish' });
  }
});

// Create a new category with logging
router.post('/categories', async (req, res) => {
  console.log('POST /categories body:', req.body);
  try {
    const { name } = req.body;
    if (!name) {
      console.log('Category name is missing');
      return res.status(400).json({ error: 'Category name is required' });
    }
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      console.log(`Category '${name}' already exists`);
      return res.status(400).json({ error: 'Category already exists' });
    }
    const newCategory = new Category({ name });
    await newCategory.save();
    console.log(`Category '${name}' created successfully`);
    res.status(201).json(newCategory);
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ error: 'Failed to create category', details: err.message });
  }
});

// Orders endpoints
// Fetch all orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().populate('dishes.dish');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Create a new order
router.post('/orders', async (req, res) => {
  try {
    const { dishes, total, discount, tip } = req.body;
    const newOrder = new Order({ dishes, total, discount, tip });
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Delete an order
router.delete('/orders/:orderId', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.orderId);
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

module.exports = router;