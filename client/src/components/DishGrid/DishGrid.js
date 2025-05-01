import React from 'react';
import logo from '../icons/logo.svg';
//import texts from '../Texts';
import './DishGrid.css'

const DishGrid = ({ categories, categoryDishes, onDishClick, userLanguage }) => (
  <div className="categories-dishes">
    {categories.map(category => (
      <div key={category._id} className="category-block">
        <h2>{category.name}</h2>
        <div className="dish-grid">
          {(categoryDishes[category._id] || []).map(dish => (
            <div key={dish._id} className="dish-box" onClick={() => onDishClick(dish)}>
              <img src={dish.image || logo} className="dish-image" alt={dish.name} />
              <div>{dish.name}</div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default DishGrid;
