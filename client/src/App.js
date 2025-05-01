import './App.css';

// Add basic styling for categories and dishes

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Tabs from './components/Tabs';
import DishGrid from './components/DishGrid';
import Cart from './components/Cart';
import OrdersList from './components/OrdersList';
import IngredientManager from './components/IngredientManager';
import DishModal from './components/DishModal';
import DishManager from './components/DishManager';
import CategoryManager from './components/CategoryManager';

// API instance for backend (direct URL, server has CORS enabled)
const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Add an interceptor to include the username header after login
// Ensure Content-Type header is set to application/json
API.interceptors.request.use((config) => {
  const username = localStorage.getItem('username'); // Store username in localStorage after login
  if (username) {
    config.headers['x-username'] = username;
  }
  if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

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
  const [manageView, setManageView] = useState('menu'); // 'menu', 'dishes', 'ingredients', 'categories'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userLanguage, setUserLanguage] = useState('en'); // Default to English

  // Move category fetching logic to after login
  useEffect(() => {
    if (isLoggedIn) {
      API.get('/user/categories')
        .then(response => {
          setCategories(response.data);
        })
        .catch(error => {
          console.error('Error fetching categories:', error);
        });
    }
  }, [isLoggedIn]);

  // Fetch dishes for each category automatically
  useEffect(() => {
    if (categories.length) {
      // Update the endpoint to fetch dishes by category name
      const promises = categories.map(cat =>
        API.get(`/user/categories/${cat.name}/dishes`) // Use category name instead of ID
      );
      // Add a console log to verify API responses for dishes
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

  // Fetch ingredients for management only after login
  useEffect(() => {
    // Update the endpoint to fetch ingredients from the correct route
    if (isLoggedIn) {
      API.get('/user/ingredients') // Updated to use /user prefix
        .then(res => setIngredients(res.data))
        .catch(err => console.error('Error fetching ingredients:', err));
    }
  }, [isLoggedIn]);

  // Fetch orders when switching to Orders tab
  useEffect(() => {
    if (activeTab === 'orders') {
      API.get('/user/orders')
        .then(res => setOrders(res.data))
        .catch(err => console.error('Error fetching orders:', err));
    }
  }, [activeTab]);

  useEffect(() => {
    if (isLoggedIn) {
      // Fetch the user's language from the backend or local storage after login
      const fetchUserLanguage = async () => {
        try {
          const response = await API.get('/user/language');
          setUserLanguage(response.data.language || 'en');
        } catch (error) {
          console.error('Error fetching user language:', error);
          const storedLanguage = localStorage.getItem('userLanguage');
          setUserLanguage(storedLanguage || 'en');
        }
      };

      fetchUserLanguage();
    }
  }, [isLoggedIn]);

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
    API.post('/user/dishes', newDish)
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
    API.post('/user/categories', { name })
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
    API.post('/user/orders', { dishes: cart, total, discount, tip })
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
    API.delete(`/user/orders/${id}`)
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
    API.post('/user/ingredients', { name, unit, price })
      .then(res => {
        setIngredients([...ingredients, res.data]);
        setNewIngredient({ name: '', unit: 'unit', price: 0 });
      })
      .catch(err => { console.error('Error creating ingredient:', err); alert('Failed to create ingredient'); });
  };

  const deleteIngredient = (id) => {
    if (!window.confirm('Delete this ingredient?')) return;
    API.delete(`/user/ingredients/${id}`)
      .then(() => setIngredients(ingredients.filter(i => i._id !== id)))
      .catch(err => console.error('Error deleting ingredient:', err));
  };

  // Handle opening dish modal for edit/delete
  const handleOpenDish = (dish) => {
    // keep track of the original category to refresh both lists after edit
    setSelectedDish({ ...dish, originalCategory: dish.category });
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDish(null);
  };

  // Helper to reload dishes of a category
  const refreshCategoryDishes = (categoryId) => {
    API.get(`/user/categories/${categoryId}/dishes`)
      .then(res => setCategoryDishes(prev => ({ ...prev, [categoryId]: res.data })))
      .catch(err => console.error('Error refreshing dishes for category', categoryId, err));
  };

  const saveDish = (dishToSave) => {
    console.log('Saving dish', dishToSave);
    // remove helper field before sending
    const { originalCategory, _id, ...dishData } = dishToSave;
    API.put(`/user/dishes/${_id}`, dishData)
      .then(res => {
        const updated = res.data;
        alert('Dish saved successfully!');
        // refresh updated category
        refreshCategoryDishes(updated.category);
        // if category changed, refresh original category too
        if (originalCategory && originalCategory !== updated.category) {
          refreshCategoryDishes(originalCategory);
        }
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
    API.delete(`/user/dishes/${selectedDish._id}`)
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

  // Function to handle back navigation
  const handleBackToMenu = () => setManageView('menu');

  // Add swipe detection logic
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchMove = (e) => {
      touchEndX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = () => {
      if (touchEndX > touchStartX + 50) { // Swipe right detected
        handleBackToMenu();
      }
    };

    const manageSection = document.querySelector('.manage-section');
    if (manageSection) {
      manageSection.addEventListener('touchstart', handleTouchStart);
      manageSection.addEventListener('touchmove', handleTouchMove);
      manageSection.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (manageSection) {
        manageSection.removeEventListener('touchstart', handleTouchStart);
        manageSection.removeEventListener('touchmove', handleTouchMove);
        manageSection.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [manageView]);

  // Replace the title with the respective tab names
  const getTabTitle = () => {
    switch (activeTab) {
      case 'cashier':
        return 'Take an order';
      case 'orders':
        return 'Past orders';
      case 'manage':
        return 'Settings';
      default:
        return '';
    }
  };

  // Define the updateLanguage function to handle language updates
  const updateLanguage = (language) => {
    API.put('/user/language', { language })
      .then((response) => {
        alert(`Language updated to ${response.data.language}`);
        setUserLanguage(response.data.language);
        localStorage.setItem('userLanguage', response.data.language);
      })
      .catch((error) => {
        console.error('Error updating language:', error);
        alert('Failed to update language.');
      });
  };

  // Update handleLogin to check if the user exists in the database
  const handleLogin = (e) => {
    e.preventDefault();
    API.get(`/auth/user/${username}`) // Updated to use /auth prefix
      .then((response) => {
        if (response.data) {
          setIsLoggedIn(true);
          localStorage.setItem('username', username); // Store username in localStorage
        } else {
          alert('Invalid username or password.');
        }
      })
      .catch((error) => {
        console.error('Error during login:', error);
        alert('Failed to login. Please try again.');
      });
  };

  return (
    <div className="App">
      {!isLoggedIn ? (
        <div className="login-page">
          <h1>Ordering App</h1>
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Login</button>
          </form>
        </div>
      ) : (
        <>
          <h1>{getTabTitle()}</h1>
          <div className="main-content">
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
                  userLanguage={userLanguage} // Pass the userLanguage prop
                />
              </>
            )}
            {activeTab === 'orders' && (
              <OrdersList orders={orders} onDelete={deleteOrder} />
            )}
            {activeTab === 'manage' && (
              <div className="manage-section">
                {manageView === 'menu' && (
                  <div className="manage-menu">
                    <button onClick={() => setManageView('dishes')}>
                      <div className="icon-container">
                        <img src={require('./components/icons/dishes.svg').default} alt="Manage Dishes" />
                      </div>
                      <div className="text-container">Manage Dishes</div>
                      <div className="arrow-container">&gt;</div>
                    </button>
                    <button onClick={() => setManageView('ingredients')}>
                      <div className="icon-container">
                        <img src={require('./components/icons/ingredients.svg').default} alt="Manage Ingredients" />
                      </div>
                      <div className="text-container">Manage Ingredients</div>
                      <div className="arrow-container">&gt;</div>
                    </button>
                    <button onClick={() => setManageView('categories')}>
                      <div className="icon-container">
                        <img src={require('./components/icons/categories.svg').default} alt="Manage Categories" />
                      </div>
                      <div className="text-container">Manage Categories</div>
                      <div className="arrow-container">&gt;</div>
                    </button>
                    <button onClick={() => setManageView('language')}>
                      <div className="icon-container">
                        <img src={require('./components/icons/manage.svg').default} alt="Language Settings" />
                      </div>
                      <div className="text-container">Language Settings</div>
                      <div className="arrow-container">&gt;</div>
                    </button>
                  </div>
                )}
                {manageView === 'dishes' && (
                  <div className="manage-content">
                    <button className="back-button" onClick={handleBackToMenu}>&lt; Back to Menu</button>
                    <DishManager
                      newDish={newDish}
                      categories={categories}
                      ingredients={ingredients}
                      categoryDishes={categoryDishes}
                      onChange={(field, value) => setNewDish(prev => ({ ...prev, [field]: value }))}
                      onAddIngredient={addDishIngredient}
                      onUpdateIngredient={updateDishIngredient}
                      onRemoveIngredient={removeDishIngredient}
                      onCreate={createDish}
                      onDishClick={handleOpenDish}
                    />
                  </div>
                )}
                {manageView === 'ingredients' && (
                  <div className="manage-content">
                    <button className="back-button" onClick={handleBackToMenu}>&lt; Back to Menu</button>
                    <IngredientManager
                      ingredients={ingredients}
                      newIngredient={newIngredient}
                      onNewChange={setNewIngredient}
                      onAdd={createIngredient}
                      onDelete={deleteIngredient}
                    />
                  </div>
                )}
                {manageView === 'categories' && (
                  <div className="manage-content">
                    <button className="back-button" onClick={handleBackToMenu}>&lt; Back to Menu</button>
                    <div className="categories-section">
                      <ul className="category-list">
                        {categories.map(c => <li key={c._id}>{c.name}</li>)}
                      </ul>
                      <CategoryManager onCreate={createCategory} />
                    </div>
                  </div>
                )}
                {manageView === 'language' && (
                  <div className="manage-content">
                    <button className="back-button" onClick={handleBackToMenu}>&lt; Back to Menu</button>
                    <div className="language-settings">
                      <h2>Select Language</h2>
                      <select onChange={(e) => updateLanguage(e.target.value)}>
                        <option value="en">English</option>
                        <option value="it">Italian</option>
                        {/* Add more languages as needed */}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
          {showModal && selectedDish && (
            <DishModal
              dish={selectedDish}
              categories={categories}
              onSave={saveDish}
              onDelete={confirmDeleteDish}
              onClose={handleCloseModal}
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;
