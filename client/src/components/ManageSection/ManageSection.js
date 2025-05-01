import React, { useState, useEffect } from 'react';
import DishManager from '../DishManager';
import IngredientManager from '../IngredientManager/IngredientManager';
import CategoryManager from '../CategoryManager/CategoryManager';
import texts from '../Texts';
import API from '../../api';
import DishModal from '../DishModal';
import './ManageSection.css';

const ManageSection = ({
  categories,
  userLanguage,
  updateLanguage,
  categoryDishes
}) => {
  const [manageView, setManageView] = useState('menu');
  const [newDish, setNewDish] = useState({ name: '', category: '', price: '', ingredients: [] });
  const [selectedDish, setSelectedDish] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleBackToMenu = () => setManageView('menu');

  // Dish logic moved from App.js
  const createDish = () => {
    API.post('/user/dishes', newDish)
      .then(response => {
        alert('Dish created successfully!');
        setNewDish({ name: '', category: '', price: '', ingredients: [] });
        // Optionally refresh category dishes here if needed
      })
      .catch(error => {
        console.error('Error creating dish:', error);
        alert('Failed to create dish.');
      });
  };

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

  const handleOpenDish = (dish) => {
    setSelectedDish(dish);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDish(null);
  };

  // Add swipe detection logic (unchanged)
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;
    const handleTouchStart = (e) => { touchStartX = e.changedTouches[0].screenX; };
    const handleTouchMove = (e) => { touchEndX = e.changedTouches[0].screenX; };
    const handleTouchEnd = () => { if (touchEndX > touchStartX + 50) { handleBackToMenu(); } };
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

  return (
    <div className="manage-section">
      {manageView === 'menu' && (
        <div className="manage-menu">
          <button onClick={() => setManageView('dishes')}>
            <div className="icon-container">
              <img src={require('../icons/dishes.svg').default} alt="Manage Dishes" />
            </div>
            <div className="text-container">Manage Dishes</div>
            <div className="arrow-container">&gt;</div>
          </button>
          <button onClick={() => setManageView('ingredients')}>
            <div className="icon-container">
              <img src={require('../icons/ingredients.svg').default} alt="Manage Ingredients" />
            </div>
            <div className="text-container">Manage Ingredients</div>
            <div className="arrow-container">&gt;</div>
          </button>
          <button onClick={() => setManageView('categories')}>
            <div className="icon-container">
              <img src={require('../icons/categories.svg').default} alt="Manage Categories" />
            </div>
            <div className="text-container">Manage Categories</div>
            <div className="arrow-container">&gt;</div>
          </button>
          <button onClick={() => setManageView('language')}>
            <div className="icon-container">
              <img src={require('../icons/manage.svg').default} alt="Language Settings" />
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
            categoryDishes={categoryDishes}
            onChange={(field, value) => setNewDish(prev => ({ ...prev, [field]: value }))}
            onAddIngredient={addDishIngredient}
            onUpdateIngredient={updateDishIngredient}
            onRemoveIngredient={removeDishIngredient}
            onCreate={createDish}
            onDishClick={handleOpenDish}
          />
          {showModal && selectedDish && (
            <DishModal
              dish={selectedDish}
              categories={categories}
              onSave={() => {}} // Implement save logic if needed
              onDelete={() => {}} // Implement delete logic if needed
              onClose={handleCloseModal}
            />
          )}
        </div>
      )}
      {manageView === 'ingredients' && (
        <div className="manage-content">
          <button className="back-button" onClick={handleBackToMenu}>&lt; Back to Menu</button>
          <IngredientManager userLanguage={userLanguage} />
        </div>
      )}
      {manageView === 'categories' && (
        <div className="manage-content">
          <button className="back-button" onClick={handleBackToMenu}>&lt; Back to Menu</button>
          <div className="categories-section">
            <ul className="category-list">
              {categories.map(c => <li key={c._id}>{c.name}</li>)}
            </ul>
            <CategoryManager userLanguage={userLanguage} />
          </div>
        </div>
      )}
      {manageView === 'language' && (
        <div className="manage-content">
          <button className="back-button" onClick={handleBackToMenu}>&lt; Back to Menu</button>
          <div className="language-settings">
            <h2>{texts[userLanguage]?.selectLanguage || texts['en'].selectLanguage}</h2>
            <select onChange={(e) => updateLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="it">Italian</option>
              {/* Add more languages as needed */}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSection;