const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const dotenv = require('dotenv');
const routes = require('./routes');
const { Category, User } = require('./models'); // Ensure both Category and User models are imported
const cors = require('cors');
const userRoutes = require('./userRoutes'); // Import user-dependent routes

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'defaultsecret',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// Enable CORS
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from the frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Use authentication routes
app.use('/api/auth', routes);

// Use user-dependent routes
app.use('/api/user', userRoutes);

// Add a default user for development purposes
if (process.env.NODE_ENV == 'development') {
  const { User } = require('./models');

  const createDefaultUser = async () => {
    try {
      const existingUser = await User.findOne({ username: 'user1' });
      if (!existingUser) {
        const user = new User({ username: 'user1', language: 'en' });
        await user.save();
        console.log('Default user created: user1');
      } else {
        console.log('Default user already exists: user1');
      }
    } catch (error) {
      console.error('Error creating default user:', error);
    }
  };

  // Ensure basic categories and dishes exist
  const ensureBasicCategoriesAndDishes = async () => {
    const basicCategories = [
      { name: 'Food', dishes: [
        { name: 'Sandwich', price: 7 },
        { name: 'Hamburger', price: 10 }
      ] },
      { name: 'Drinks', dishes: [
        { name: 'Water', price: 2 }
      ] }
    ];

    try {
      const user = await User.findOne({ username: 'user1' });
      if (!user) {
        console.error("User 'user1' not found.");
        return;
      }

      for (const category of basicCategories) {
        // Add category if it doesn't exist
        if (!user.categories.some(c => c.name === category.name)) {
          user.categories.push({ name: category.name });
          console.log(`Category '${category.name}' added for user1.`);
        }

        // Add dishes to the user
        for (const dish of category.dishes) {
          if (!user.dishes.some(d => d.name === dish.name)) {
            user.dishes.push({ name: dish.name, category: category.name, price: dish.price });
            console.log(`Dish '${dish.name}' added to category '${category.name}' for user1.`);
          }
        }
      }

      await user.save();
    } catch (err) {
      console.error('Error ensuring basic categories and dishes:', err);
    }
  };

  // Call ensureBasicCategoriesAndDishes after creating the default user
  createDefaultUser().then(() => ensureBasicCategoriesAndDishes());
}

// Call ensureBasicCategoriesAndDishes after connecting to the database and then start server
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error('MongoDB connection error:', err));