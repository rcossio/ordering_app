const express = require('express');
const router = express.Router();
const { User } = require('./models');

// Middleware to fetch user by username (or other identifier)
router.use(async (req, res, next) => {
  try {
    const username = req.headers['x-username']; // Replace with actual user identification logic
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    req.user = user; // Attach user to request object
    next();
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user', details: err.message });
  }
});

// Fetch all categories for the user
router.get('/categories', async (req, res) => {
  try {
    res.json(req.user.categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Fetch all dishes in a category for the user
router.get('/categories/:categoryName/dishes', async (req, res) => {
  try {
    const { categoryName } = req.params;
    const dishes = req.user.dishes.filter(dish => dish.category === categoryName); // Match by category name
    res.json(dishes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dishes' });
  }
});

// Create a new dish for the user
router.post('/dishes', async (req, res) => {
  try {
    const { name, categoryName, price, ingredients } = req.body; // Expect categoryName instead of category ID
    const newDish = { name, category: categoryName, price, ingredients }; // Save category name
    req.user.dishes.push(newDish);
    await req.user.save();
    res.status(201).json(newDish);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create dish', details: err.message });
  }
});

// Update a dish for the user
router.put('/dishes/:dishName', async (req, res) => {
  try {
    const { dishName } = req.params;
    const dish = req.user.dishes.find(d => d.name === dishName);
    if (!dish) {
      return res.status(404).json({ error: 'Dish not found' });
    }
    Object.assign(dish, req.body);
    await req.user.save();
    res.json(dish);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update dish', details: err.message });
  }
});

// Delete a dish for the user
router.delete('/dishes/:dishName', async (req, res) => {
  try {
    const { dishName } = req.params;
    req.user.dishes = req.user.dishes.filter(d => d.name !== dishName);
    await req.user.save();
    res.json({ message: 'Dish deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete dish', details: err.message });
  }
});

// Fetch all orders for the user
router.get('/orders', async (req, res) => {
  try {
    res.json(req.user.orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Create a new order for the user
router.post('/orders', async (req, res) => {
  try {
    const { dishes, total, discount, tip } = req.body;
    const newOrder = { dishes, total, discount, tip, createdAt: new Date() };
    req.user.orders.push(newOrder);
    await req.user.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order', details: err.message });
  }
});

// Delete an order for the user
router.delete('/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    req.user.orders = req.user.orders.filter(order => order._id.toString() !== orderId);
    await req.user.save();
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order', details: err.message });
  }
});

// Fetch all ingredients for the user
router.get('/ingredients', async (req, res) => {
  try {
    res.json(req.user.ingredients);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ingredients' });
  }
});

// Create a new ingredient for the user
router.post('/ingredients', async (req, res) => {
  try {
    const { name, unit, price } = req.body;
    const language = req.user.language || 'default';
    const newIngredient = {
      name: {
        default: name,
        [language]: name,
      },
      unit,
      price,
    };
    req.user.ingredients.push(newIngredient);
    await req.user.save();
    res.status(201).json(newIngredient);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create ingredient', details: err.message });
  }
});

// Update an ingredient for the user
router.put('/ingredients/:ingredientName', async (req, res) => {
  try {
    const { ingredientName } = req.params;
    const ingredient = req.user.ingredients.find(i => i.name.default === ingredientName);
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    Object.assign(ingredient, req.body);
    await req.user.save();
    res.json(ingredient);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update ingredient', details: err.message });
  }
});

// Delete an ingredient for the user
router.delete('/ingredients/:ingredientName', async (req, res) => {
  try {
    const { ingredientName } = req.params;
    req.user.ingredients = req.user.ingredients.filter(i => i.name.default !== ingredientName);
    await req.user.save();
    res.json({ message: 'Ingredient deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete ingredient', details: err.message });
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

// Get the user's language configuration
router.get('/user/language', async (req, res) => {
  try {
    res.json({ language: req.user.language });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user language', details: err.message });
  }
});

// Update the user's language configuration
router.put('/user/language', async (req, res) => {
  try {
    const { language } = req.body;
    req.user.language = language;
    await req.user.save();
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user language', details: err.message });
  }
});

module.exports = router;