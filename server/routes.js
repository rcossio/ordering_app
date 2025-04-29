const express = require('express');
const router = express.Router();
const { Category, Dish, Ingredient, Order } = require('./models');

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

// Create a new dish with recipe ingredients
router.post('/dishes', async (req, res) => {
  try {
    const { name, category, price, ingredients } = req.body;
    const newDish = new Dish({ name, category, price, ingredients });
    await newDish.save();
    res.status(201).json(newDish);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create dish', details: err.message });
  }
});

// Update a dish
router.put('/dishes/:dishId', async (req, res) => {
  try {
    const updated = await Dish.findByIdAndUpdate(req.params.dishId, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update dish', details: err.message });
  }
});

// Delete a dish
router.delete('/dishes/:dishId', async (req, res) => {
  try {
    await Dish.findByIdAndDelete(req.params.dishId);
    res.json({ message: 'Dish deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete dish', details: err.message });
  }
});

// Optionally, fetch all dishes
router.get('/dishes', async (req, res) => {
  try {
    const dishes = await Dish.find().populate('category');
    res.json(dishes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all dishes' });
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

// Ingredient CRUD endpoints
router.get('/ingredients', async (req, res) => {
  try {
    const ingredients = await Ingredient.find();
    res.json(ingredients);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ingredients' });
  }
});

router.post('/ingredients', async (req, res) => {
  try {
    const { name, unit, price } = req.body;
    const ingredient = new Ingredient({ name, unit, price });
    await ingredient.save();
    res.status(201).json(ingredient);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create ingredient', details: err.message });
  }
});

router.put('/ingredients/:ingredientId', async (req, res) => {
  try {
    const updated = await Ingredient.findByIdAndUpdate(
      req.params.ingredientId,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update ingredient' });
  }
});

router.delete('/ingredients/:ingredientId', async (req, res) => {
  try {
    await Ingredient.findByIdAndDelete(req.params.ingredientId);
    res.json({ message: 'Ingredient deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete ingredient' });
  }
});

// Generate ingredient usage and cost report over a date range
router.get('/reports/ingredients', async (req, res) => {
  try {
    const { start, end } = req.query;
    const filter = {};
    if (start || end) filter.createdAt = {};
    if (start) filter.createdAt.$gte = new Date(start);
    if (end) filter.createdAt.$lte = new Date(end);
    const orders = await Order.find(filter).populate({
      path: 'dishes.dish',
      populate: { path: 'ingredients.ingredient' }
    });
    const usageMap = {};
    orders.forEach(order => {
      order.dishes.forEach(({ dish, quantity: dishQty }) => {
        if (!dish) return;
        dish.ingredients.forEach(({ ingredient, quantity }) => {
          if (!ingredient) return;
          const key = ingredient._id.toString();
          if (!usageMap[key]) {
            usageMap[key] = {
              ingredientId: ingredient._id,
              name: ingredient.name,
              unit: ingredient.unit,
              price: ingredient.price,
              totalQuantity: 0
            };
          }
          usageMap[key].totalQuantity += quantity * dishQty;
        });
      });
    });
    const report = Object.values(usageMap).map(item => ({
      ...item,
      totalCost: item.totalQuantity * item.price
    }));
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate ingredient report', details: err.message });
  }
});

module.exports = router;