import './App.css';
import React, { useState, useEffect } from 'react';
import Tabs from './components/Tabs/Tabs';
import OrdersContainer from './components/OrdersContainer';
import Login from './components/Login/Login';
import ManageSection from './components/ManageSection/ManageSection';
import texts from './components/Texts';
import CashierContainer from './components/CashierContainer';
import API from './api'; // Import the API instance

const App = () => {
  const [categories, setCategories] = useState([]);
  const [categoryDishes, setCategoryDishes] = useState({});
  const [activeTab, setActiveTab] = useState('cashier');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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

  // Handle login success from Login component
  const handleLoginSuccess = (username) => {
    setIsLoggedIn(true);
    localStorage.setItem('username', username);
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

  return (
    <div className="App">
      {!isLoggedIn ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <>
          <h1>{texts[userLanguage]?.tabTitles?.[activeTab] || 'Ordering App'}</h1>
          <div className="main-content">
            {activeTab === 'cashier' && (
              <CashierContainer
                categories={categories}
                categoryDishes={categoryDishes}
                userLanguage={userLanguage}
              />
            )}
            {activeTab === 'orders' && (
              <OrdersContainer userLanguage={userLanguage} />
            )}
            {activeTab === 'manage' && (
              <ManageSection
                categories={categories}
                categoryDishes={categoryDishes}
                userLanguage={userLanguage}
                updateLanguage={updateLanguage}
              />
            )}
          </div>
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </>
      )}
    </div>
  );
};

export default App;
