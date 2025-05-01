const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const dotenv = require('dotenv');
const routes = require('./routes');
const { Category } = require('./models');
const cors = require('cors');

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

// Use routes
app.use('/api', routes);

// Ensure basic categories exist
const ensureBasicCategories = async () => {
  const basicCategories = ['Food', 'Drinks'];
  for (const name of basicCategories) {
    try {
      const existingCategory = await Category.findOne({ name });
      if (!existingCategory) {
        await new Category({ name }).save();
        console.log(`Category '${name}' added to the database.`);
      } else {
        console.log(`Category '${name}' already exists.`);
      }
    } catch (err) {
      console.error(`Error ensuring category '${name}':`, err);
    }
  }
};

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

  createDefaultUser();
}

// Call ensureBasicCategories after connecting to the database and then start server
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    await ensureBasicCategories();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error('MongoDB connection error:', err));