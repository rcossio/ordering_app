import React from 'react';
import texts from './Texts';

const IngredientManager = ({ ingredients, newIngredient, onNewChange, onAdd, onDelete, userLanguage }) => (
  <div className="ingredients-management">
    <h2>{texts[userLanguage]?.manageIngredients || texts['en'].manageIngredients}</h2>
    <ul>
      {ingredients.map(i => (
        <li key={i._id}>
          {i.name} ({i.unit}) - ${i.price.toFixed(2)}
          <button type="button" onClick={() => onDelete(i._id)}>Delete</button>
        </li>
      ))}
    </ul>
    <div className="create-ingredient">
      <input
        type="text"
        placeholder="Name"
        value={newIngredient.name}
        onChange={e => onNewChange({ ...newIngredient, name: e.target.value })}
      />
      <select
        value={newIngredient.unit}
        onChange={e => onNewChange({ ...newIngredient, unit: e.target.value })}
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
        onChange={e => onNewChange({ ...newIngredient, price: Number(e.target.value) })}
      />
      <button type="button" onClick={onAdd}>Add Ingredient</button>
    </div>
  </div>
);

export default IngredientManager;