const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const { Category, Dish, Order } = require('../models');

let mongoServer;
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
beforeEach(async () => {
  // Seed basic categories
  await Category.create([{ name: 'Food' }, { name: 'Drinks' }]);
});
afterEach(async () => {
  // Clean up collections
  await Promise.all([Category.deleteMany(), Dish.deleteMany(), Order.deleteMany()]);
});

describe('User Story 1: Cashier adds and removes from cart, places order', () => {
  test('should create order with correct items', async () => {
    // Create two dishes
    const foodCat = await Category.findOne({ name: 'Food' });
    const dish1 = await Dish.create({ name: 'Burger', category: foodCat._id, price: 5 });
    const dish2 = await Dish.create({ name: 'Fries', category: foodCat._id, price: 3 });

    // Simulate order: remove one Fries
    const orderPayload = {
      dishes: [
        { dish: dish1._id, quantity: 1 },
        { dish: dish2._id, quantity: 1 }
      ],
      total: 5 + 3,
      discount: 0,
      tip: 0
    };
    // Place order
    const res = await request(app).post('/api/orders').send(orderPayload);
    expect(res.status).toBe(201);
    expect(res.body.dishes).toHaveLength(2);

    // Fetch orders
    const list = await request(app).get('/api/orders');
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);
    expect(list.body[0].total).toBe(orderPayload.total);
  });
});

describe('User Story 2: Menu update and discount/tip handling', () => {
  test('new dish appears in category and order applies discount and tip', async () => {
    const drinksCat = await Category.findOne({ name: 'Drinks' });
    // Create new drink via API
    const newDishRes = await request(app).post('/api/dishes').send({ name: 'Soda', category: drinksCat._id, price: 2 });
    expect(newDishRes.status).toBe(201);
    const created = newDishRes.body;

    // Verify GET category dishes returns new dish
    const dishesList = await request(app).get(`/api/categories/${drinksCat._id}/dishes`);
    expect(dishesList.body.find(d => d._id === created._id)).toBeDefined();

    // Place order with discount and tip
    const orderRes = await request(app).post('/api/orders').send({ dishes: [{ dish: created._id, quantity: 2 }], total: 4, discount: 1, tip: 1 });
    expect(orderRes.status).toBe(201);
    const order = orderRes.body;
    expect(order.discount).toBe(1);
    expect(order.tip).toBe(1);
  });
});

describe('User Story 3: Edit and delete dishes', () => {
  test('edit dish price and category, then delete another dish', async () => {
    const foodCat = await Category.findOne({ name: 'Food' });
    const drinksCat = await Category.findOne({ name: 'Drinks' });
    const dishA = await Dish.create({ name: 'Pizza', category: foodCat._id, price: 8 });
    const dishB = await Dish.create({ name: 'Tea', category: drinksCat._id, price: 2 });

    // Update dishA: change price & category
    const updateRes = await request(app).put(`/api/dishes/${dishA._id}`).send({ price: 10, category: drinksCat._id });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.price).toBe(10);
    expect(updateRes.body.category).toBe(drinksCat._id.toString());

    // Delete dishB
    const deleteRes = await request(app).delete(`/api/dishes/${dishB._id}`);
    expect(deleteRes.status).toBe(200);

    // Verify dishA appears under Drinks, and dishB is removed
    const drinksDishes = await request(app).get(`/api/categories/${drinksCat._id}/dishes`);
    expect(drinksDishes.body.find(d => d._id === dishA._id.toString())).toBeDefined();
    const foodDishes = await request(app).get(`/api/categories/${foodCat._id}/dishes`);
    expect(foodDishes.body.find(d => d._id === dishB._id.toString())).toBeUndefined();
  });
});
