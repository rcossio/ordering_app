import React from 'react';
import texts from './Texts';

const DishForm = ({ newDish, categories, ingredients, onChange, onAddIngredient, onUpdateIngredient, onRemoveIngredient, onCreate, userLanguage }) => (
  <div className="create-dish">
    <h2>{texts[userLanguage]?.createDish || texts['en'].createDish}</h2>
    <input
      type="text"
      placeholder="Dish Name"
      value={newDish.name}
      onChange={e => onChange('name', e.target.value)}
    />
    <select
      value={newDish.category}
      onChange={e => onChange('category', e.target.value)}
    >
      <option value="">Select Category</option>
      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
    </select>
    <input
      type="number"
      placeholder="Price"
      value={newDish.price}
      onChange={e => onChange('price', e.target.value)}
    />
    <h3>Ingredients</h3>
    {newDish.ingredients.map((ing, idx) => (
      <div key={idx} className="dish-ingredient-row">
        <select
          value={ing.ingredient}
          onChange={e => onUpdateIngredient(idx, 'ingredient', e.target.value)}
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
          onChange={e => onUpdateIngredient(idx, 'quantity', e.target.value)}
        />
        <button type="button" onClick={() => onRemoveIngredient(idx)}>-</button>
      </div>
    ))}
    <button type="button" onClick={onAddIngredient}>Add Ingredient</button>
    <button type="button" onClick={onCreate}>Create Dish</button>
  </div>
);

export default DishForm;
