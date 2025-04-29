import './App.css';

// Add basic styling for categories and dishes

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logo from './logo.svg'; // placeholder image for dishes

// API instance for backend (direct URL, server has CORS enabled)
const API = axios.create({ baseURL: 'http://localhost:5000/api' });

const App = () => {
  const [categories, setCategories] = useState([]);
  const [categoryDishes, setCategoryDishes] = useState({});
  const [cart, setCart] = useState([]);
  const [newDish, setNewDish] = useState({ name: '', category: '', price: '', ingredients: [] });
  const [newCategory, setNewCategory] = useState('');
  const [activeTab, setActiveTab] = useState('cashier');
  const [discount, setDiscount] = useState(0);
  const [tip, setTip] = useState(0);
  const [orders, setOrders] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState({ name: '', unit: 'unit', price: 0 });
  const [selectedDish, setSelectedDish] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
  // Fetch dishes for each category automatically
  useEffect(() => {
    if (categories.length) {
      const promises = categories.map(cat =>
        API.get(`/categories/${cat._id}/dishes`)
      );
      Promise.all(promises)
        .then(results => {
          const map = {};
          results.forEach((res, idx) => {
            map[categories[idx]._id] = res.data;
          });
          setCategoryDishes(map);
        })
        .catch(err => console.error('Error fetching dishes:', err));
    }
  }, [categories]);

  // Fetch ingredients for management
  useEffect(() => {
    API.get('/ingredients')
      .then(res => setIngredients(res.data))
      .catch(err => console.error('Error fetching ingredients:', err));
  }, []);

  // Fetch orders when switching to Orders tab
  useEffect(() => {
    if (activeTab === 'orders') {
      API.get('/orders')
        .then(res => setOrders(res.data))
        .catch(err => console.error('Error fetching orders:', err));
    }
  }, [activeTab]);

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
        setNewDish({ name: '', category: '', price: '', ingredients: [] });
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

  // Handlers for dish ingredients
  const addDishIngredient = () => {
    setNewDish({ ...newDish, ingredients: [...newDish.ingredients, { ingredient: '', quantity: 1 }] });
  };
  const updateDishIngredient = (index, field, value) => {
    const ing = [...newDish.ingredients];
    ing[index][field] = field === 'quantity' ? Number(value) : value;
    setNewDish({ ...newDish, ingredients: ing });
  };
  const removeDishIngredient = (index) => {
    setNewDish({ ...newDish, ingredients: newDish.ingredients.filter((_, i) => i !== index) });
  };

  const createIngredient = () => {
    const { name, unit, price } = newIngredient;
    if (!name) return alert('Name required');
    API.post('/ingredients', { name, unit, price })
      .then(res => {
        setIngredients([...ingredients, res.data]);
        setNewIngredient({ name: '', unit: 'unit', price: 0 });
      })
      .catch(err => { console.error('Error creating ingredient:', err); alert('Failed to create ingredient'); });
  };

  const deleteIngredient = (id) => {
    if (!window.confirm('Delete this ingredient?')) return;
    API.delete(`/ingredients/${id}`)
      .then(() => setIngredients(ingredients.filter(i => i._id !== id)))
      .catch(err => console.error('Error deleting ingredient:', err));
  };

  // Handle opening dish modal for edit/delete
  const handleOpenDish = (dish) => {
    setSelectedDish({ ...dish });
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDish(null);
  };
  const handleDishChange = (field, value) => {
    setSelectedDish(prev => ({ ...prev, [field]: value }));
  };

  // Helper to reload dishes of a category
  const refreshCategoryDishes = (categoryId) => {
    API.get(`/categories/${categoryId}/dishes`)
      .then(res => setCategoryDishes(prev => ({ ...prev, [categoryId]: res.data })))
      .catch(err => console.error('Error refreshing dishes for category', categoryId, err));
  };

  const saveDish = () => {
    console.log('Saving dish', selectedDish);
    API.put(`/dishes/${selectedDish._id}`, selectedDish)
      .then(res => {
        console.log('Dish saved response', res.data);
        const updated = res.data;
        alert('Dish saved successfully!');
        refreshCategoryDishes(updated.category);
        handleCloseModal();
      })
      .catch(err => {
        console.error('Error saving dish:', err);
        alert('Failed to save dish. See console for details.');
      });
  };
  const confirmDeleteDish = () => {
    if (!window.confirm('Delete this dish?')) return;
    console.log('Deleting dish', selectedDish._id);
    API.delete(`/dishes/${selectedDish._id}`)
      .then(res => {
        console.log('Dish delete response', res.data);
        alert('Dish deleted successfully!');
        refreshCategoryDishes(selectedDish.category);
        handleCloseModal();
      })
      .catch(err => {
        console.error('Error deleting dish:', err);
        alert('Failed to delete dish. See console for details.');
      });
  };

  return (
    <div className="App">
      <h1>Ordering App</h1>
      <div className="tabs">
        <button onClick={() => setActiveTab('cashier')} disabled={activeTab==='cashier'}>Cashier</button>
        <button onClick={() => setActiveTab('orders')} disabled={activeTab==='orders'}>Orders</button>
        <button onClick={() => setActiveTab('manage')} disabled={activeTab==='manage'}>Manage</button>
      </div>
      {activeTab === 'cashier' && (
        <>
          <div className="categories-dishes">
            {categories.map(category => (
              <div key={category._id} className="category-block">
                <h2>{category.name}</h2>
                <div className="dish-grid">
                  {(categoryDishes[category._id] || []).map(dish => (
                    <div key={dish._id} className="dish-box" onClick={() => addToCart(dish)}>
                      <img src={dish.image || logo} className="dish-image" alt={dish.name} />
                      <div>{dish.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="cart">
            <h2>Cart</h2>
            <ul>
              {cart.map(item => (
                <li key={item._id}>
                  <span>{item.name} x {item.quantity}</span>
                  <button onClick={() => removeFromCart(item._id)}>-</button>
                </li>
              ))}
            </ul>
            <p>Subtotal: ${calculateTotal().toFixed(2)}</p>
            <div className="discount-tip-group">
              <label>
                Discount
                <input type="number" placeholder="0" value={discount} onChange={e => setDiscount(Number(e.target.value))} />
              </label>
              <label>
                Tip
                <input type="number" placeholder="0" value={tip} onChange={e => setTip(Number(e.target.value))} />
              </label>
            </div>
            <p>Total: ${(calculateTotal() - discount + tip).toFixed(2)}</p>
            <button onClick={confirmOrder}>Confirm Order</button>
          </div>
        </>
      )}
      {activeTab === 'orders' && (
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
      {activeTab === 'manage' && (
        <>
          {/* Reuse cashier categories-dishes for editing */}
          <div className="categories-dishes">
            {categories.map(category => (
              <div key={category._id} className="category-block">
                <h2>{category.name}</h2>
                <div className="dish-grid">
                  {(categoryDishes[category._id] || []).map(dish => (
                    <div key={dish._id} className="dish-box" onClick={() => handleOpenDish(dish)}>
                      <img src={dish.image || logo} className="dish-image" alt={dish.name} />
                      <div>{dish.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
            <h3>Ingredients</h3>
            {newDish.ingredients.map((ing, idx) => (
              <div key={idx} className="dish-ingredient-row">
                <select
                  value={ing.ingredient}
                  onChange={e => updateDishIngredient(idx, 'ingredient', e.target.value)}
                >
                  <option value="">Select Ingredient</option>
                  {ingredients.map(i => (
                    <option key={i._id} value={i._id}>{i.name} ({i.unit})</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={ing.quantity}
                  min={1}
                  onChange={e => updateDishIngredient(idx, 'quantity', e.target.value)}
                />
                <button onClick={() => removeDishIngredient(idx)}>-</button>
              </div>
            ))}
            <button onClick={addDishIngredient}>Add Ingredient</button>
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
          {/* Ingredient Management */}
          <div className="ingredients-management">
            <h2>Manage Ingredients</h2>
            <ul>
              {ingredients.map(i => (
                <li key={i._id}>
                  {i.name} ({i.unit}) - ${i.price.toFixed(2)}
                  <button onClick={() => deleteIngredient(i._id)}>Delete</button>
                </li>
              ))}
            </ul>
            <div className="create-ingredient">
              <input
                type="text"
                placeholder="Name"
                value={newIngredient.name}
                onChange={e => setNewIngredient({ ...newIngredient, name: e.target.value })}
              />
              <select
                value={newIngredient.unit}
                onChange={e => setNewIngredient({ ...newIngredient, unit: e.target.value })}
              >
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="unit">unit</option>
                <option value="slice">slice</option>
                <option value="general">general</option>
              </select>
              <input
                type="number"
                placeholder="Price"
                value={newIngredient.price}
                onChange={e => setNewIngredient({ ...newIngredient, price: Number(e.target.value) })}
              />
              <button onClick={createIngredient}>Add Ingredient</button>
            </div>
          </div>
        </>
      )}
      {/* Modal for editing/deleting a dish */}
      {showModal && selectedDish && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Dish</h3>
            <label>Name
              <input type="text" value={selectedDish.name || ''} onChange={e => handleDishChange('name', e.target.value)} />
            </label>
            <label>Category
              <select value={selectedDish.category || ''} onChange={e => handleDishChange('category', e.target.value)}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </label>
            <label>Price
              <input type="number" value={selectedDish.price || 0} onChange={e => handleDishChange('price', Number(e.target.value))} />
            </label>
            {/* Optionally list/edit recipe ingredients here if needed */}
            <div className="modal-buttons">
              <button type="button" onClick={handleCloseModal}>Cancel</button>
              <button type="button" onClick={confirmDeleteDish}>Delete</button>
              <button type="button" onClick={saveDish}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
