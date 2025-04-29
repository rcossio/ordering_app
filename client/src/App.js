import './App.css';

// Add basic styling for categories and dishes

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logo from './logo.svg'; // placeholder image for dishes
import Tabs from './components/Tabs';
import DishGrid from './components/DishGrid';
import Cart from './components/Cart';
import OrdersList from './components/OrdersList';
import CreateDishForm from './components/CreateDishForm';
import CreateCategoryForm from './components/CreateCategoryForm';
import IngredientManager from './components/IngredientManager';
import EditDishModal from './components/EditDishModal';

// API instance for backend (direct URL, server has CORS enabled)
const API = axios.create({ baseURL: 'http://localhost:5000/api' });

const App = () => {
  const [categories, setCategories] = useState([]);
  const [categoryDishes, setCategoryDishes] = useState({});
  const [cart, setCart] = useState([]);
  const [newDish, setNewDish] = useState({ name: '', category: '', price: '', ingredients: [] });
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
        const created = response.data;
        alert('Dish created successfully!');
        // Clear form
        setNewDish({ name: '', category: '', price: '', ingredients: [] });
        // Refresh this category's dishes so it appears in the menu
        refreshCategoryDishes(created.category);
      })
      .catch(error => {
        console.error('Error creating dish:', error);
        alert('Failed to create dish.');
      });
  };

  const createCategory = (name) => {
    API.post('/categories', { name })
      .then(response => {
        setCategories(prev => [...prev, response.data]);
        alert('Category created successfully!');
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
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === 'cashier' && (
        <>
          <DishGrid categories={categories} categoryDishes={categoryDishes} onDishClick={addToCart} />
          <Cart
            cart={cart}
            subtotal={calculateTotal()}
            discount={discount}
            tip={tip}
            onRemove={removeFromCart}
            onDiscountChange={setDiscount}
            onTipChange={setTip}
            onConfirm={confirmOrder}
          />
        </>
      )}
      {activeTab === 'orders' && (
        <OrdersList orders={orders} onDelete={deleteOrder} />
      )}
      {activeTab === 'manage' && (
        <>
          <DishGrid categories={categories} categoryDishes={categoryDishes} onDishClick={handleOpenDish} />
          <CreateDishForm
            newDish={newDish}
            categories={categories}
            ingredients={ingredients}
            onChange={(field, value) => setNewDish(prev => ({ ...prev, [field]: value }))}
            onAddIngredient={addDishIngredient}
            onUpdateIngredient={updateDishIngredient}
            onRemoveIngredient={removeDishIngredient}
            onCreate={createDish}
          />
          <CreateCategoryForm onCreate={createCategory} />
          <IngredientManager
            ingredients={ingredients}
            newIngredient={newIngredient}
            onNewChange={setNewIngredient}
            onAdd={createIngredient}
            onDelete={deleteIngredient}
          />
        </>
      )}
      {showModal && selectedDish && (
        <EditDishModal
          dish={selectedDish}
          categories={categories}
          onSave={saveDish}
          onDelete={confirmDeleteDish}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default App;
