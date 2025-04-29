import './App.css';

// Add basic styling for categories and dishes

import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Add API instance for backend
const API = axios.create({ baseURL: 'http://localhost:5000/api' });

const App = () => {
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [newDish, setNewDish] = useState({ name: '', category: '', price: '' });
  const [newCategory, setNewCategory] = useState('');
  const [activeTab, setActiveTab] = useState('cashier');
  const [discount, setDiscount] = useState(0);
  const [tip, setTip] = useState(0);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    console.log('Fetching categories...');
    API.get('/categories')
      .then(response => {
        console.log('Fetched categories:', response.data);
        setCategories(response.data);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });
  }, []);

  // Fetch orders when switching to Orders tab
  useEffect(() => {
    if (activeTab === 'orders') {
      API.get('/orders')
        .then(res => setOrders(res.data))
        .catch(err => console.error('Error fetching orders:', err));
    }
  }, [activeTab]);

  const fetchDishes = (categoryId) => {
    setSelectedCategory(categoryId);
    API.get(`/categories/${categoryId}/dishes`)
      .then(response => setDishes(response.data))
      .catch(error => console.error('Error fetching dishes:', error));
  };

  const addToCart = (dish) => {
    setCart((prevCart) => {
      const existingDish = prevCart.find((item) => item._id === dish._id);
      if (existingDish) {
        return prevCart.map((item) =>
          item._id === dish._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...dish, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (dishId) => {
    setCart((prevCart) => {
      const existingDish = prevCart.find((item) => item._id === dishId);
      if (existingDish.quantity > 1) {
        return prevCart.map((item) =>
          item._id === dishId ? { ...item, quantity: item.quantity - 1 } : item
        );
      } else {
        return prevCart.filter((item) => item._id !== dishId);
      }
    });
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.quantity * (item.price || 0), 0);
  };

  const createDish = () => {
    API.post('/dishes', newDish)
      .then(response => {
        alert('Dish created successfully!');
        setNewDish({ name: '', category: '', price: '' });
      })
      .catch(error => {
        console.error('Error creating dish:', error);
        alert('Failed to create dish.');
      });
  };

  const createCategory = () => {
    console.log('Creating category:', newCategory);
    API.post('/categories', { name: newCategory })
      .then(response => {
        console.log('Category created:', response.data);
        alert('Category created successfully!');
        setCategories([...categories, response.data]);
        setNewCategory('');
      })
      .catch(error => {
        console.error('Error creating category:', error);
        alert('Failed to create category.');
      });
  };

  const confirmOrder = () => {
    if (!cart.length) return alert('Cart is empty');
    if (!window.confirm('Confirm and save this order?')) return;
    const total = calculateTotal();
    API.post('/orders', { dishes: cart, total, discount, tip })
      .then(() => {
        alert('Order saved!');
        setCart([]);
        setDiscount(0);
        setTip(0);
      })
      .catch(err => {
        console.error('Error saving order:', err);
        alert('Failed to save order');
      });
  };

  const deleteOrder = (id) => {
    if (!window.confirm('Delete this order?')) return;
    API.delete(`/orders/${id}`)
      .then(() => setOrders(orders.filter(o => o._id !== id)))
      .catch(err => console.error('Error deleting order:', err));
  };

  return (
    <div className="App">
      <h1>Ordering App</h1>
      <div className="tabs">
        <button onClick={() => setActiveTab('cashier')} disabled={activeTab==='cashier'}>Cashier</button>
        <button onClick={() => setActiveTab('orders')} disabled={activeTab==='orders'}>Orders</button>
      </div>
      {activeTab === 'cashier' ? (
        <>
          <div className="categories">
            <h2>Categories</h2>
            <ul>
              {categories.map(category => (
                <li key={category._id} onClick={() => fetchDishes(category._id)}>
                  {category.name}
                </li>
              ))}
            </ul>
          </div>
          <div className="dishes">
            <h2>Dishes</h2>
            {selectedCategory ? (
              <ul>
                {dishes.map(dish => (
                  <li key={dish._id} onClick={() => addToCart(dish)}>{dish.name}</li>
                ))}
              </ul>
            ) : (
              <p>Select a category to view dishes</p>
            )}
          </div>
          <div className="cart">
            <h2>Cart</h2>
            <ul>
              {cart.map(item => (
                <li key={item._id}>{item.name} x {item.quantity}<button onClick={() => removeFromCart(item._id)}>-</button></li>
              ))}
            </ul>
            <p>Subtotal: ${calculateTotal().toFixed(2)}</p>
            <input type="number" placeholder="Discount" value={discount} onChange={e => setDiscount(Number(e.target.value))} />
            <input type="number" placeholder="Tip" value={tip} onChange={e => setTip(Number(e.target.value))} />
            <p>Total: ${(calculateTotal() - discount + tip).toFixed(2)}</p>
            <button onClick={confirmOrder}>Confirm Order</button>
          </div>
          <div className="create-dish">
            <h2>Create Dish</h2>
            <input
              type="text"
              placeholder="Dish Name"
              value={newDish.name}
              onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
            />
            <select
              value={newDish.category}
              onChange={(e) => setNewDish({ ...newDish, category: e.target.value })}
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Price"
              value={newDish.price}
              onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
            />
            <button onClick={createDish}>Create Dish</button>
          </div>
          <div className="create-category">
            <h2>Create Category</h2>
            <input
              type="text"
              placeholder="Category Name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button onClick={createCategory}>Create Category</button>
          </div>
        </>
      ) : (
        <div className="orders">
          <h2>Past Orders</h2>
          <ul>
            {orders.map(o => (
              <li key={o._id}>
                {new Date(o.createdAt).toLocaleString()} - ${o.total} <button onClick={() => deleteOrder(o._id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
