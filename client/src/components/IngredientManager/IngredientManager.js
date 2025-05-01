import React, { useState, useEffect } from 'react';
import texts from '../Texts';
import API from '../../api';
import './IngredientManager.css';

const IngredientManager = ({ userLanguage }) => {
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState({ name: '', unit: 'unit', price: 0 });

  useEffect(() => {
    API.get('/user/ingredients')
      .then(res => setIngredients(res.data))
      .catch(err => console.error('Error fetching ingredients:', err));
  }, []);

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

  return (
    <div className="ingredients-management">
      <h2>{texts[userLanguage]?.manageIngredients || texts['en'].manageIngredients}</h2>
      <ul>
        {ingredients.map(i => (
          <li key={i._id}>
            {i.name} ({i.unit}) - ${i.price.toFixed(2)}
            <button type="button" onClick={() => deleteIngredient(i._id)}>Delete</button>
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
        <button type="button" onClick={createIngredient}>Add Ingredient</button>
      </div>
    </div>
  );
};

export default IngredientManager;