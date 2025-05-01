import React, { useState, useEffect } from 'react';
import DishManager from '../DishManager';
import IngredientManager from '../IngredientManager';
import CategoryManager from '../CategoryManager';
import texts from '../Texts';
import './ManageSection.css';

const ManageSection = ({
  categories,
  ingredients,
  newDish,
  newIngredient,
  categoryDishes,
  onDishChange,
  onAddDishIngredient,
  onUpdateDishIngredient,
  onRemoveDishIngredient,
  onCreateDish,
  onDishClick,
  onCreateCategory,
  onNewIngredientChange,
  onAddIngredient,
  onDeleteIngredient,
  userLanguage,
  updateLanguage
}) => {
  const [manageView, setManageView] = useState('menu');

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
            ingredients={ingredients}
            categoryDishes={categoryDishes}
            onChange={onDishChange}
            onAddIngredient={onAddDishIngredient}
            onUpdateIngredient={onUpdateDishIngredient}
            onRemoveIngredient={onRemoveDishIngredient}
            onCreate={onCreateDish}
            onDishClick={onDishClick}
          />
        </div>
      )}
      {manageView === 'ingredients' && (
        <div className="manage-content">
          <button className="back-button" onClick={handleBackToMenu}>&lt; Back to Menu</button>
          <IngredientManager
            ingredients={ingredients}
            newIngredient={newIngredient}
            onNewChange={onNewIngredientChange}
            onAdd={onAddIngredient}
            onDelete={onDeleteIngredient}
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
            <CategoryManager onCreate={onCreateCategory} userLanguage={userLanguage} />
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