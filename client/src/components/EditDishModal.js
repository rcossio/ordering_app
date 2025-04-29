import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const EditDishModal = ({ dish, categories, onSave, onDelete, onClose }) => {
  const [edited, setEdited] = useState(dish);

  useEffect(() => {
    setEdited(dish);
  }, [dish]);

  const handleChange = (field, value) => {
    setEdited(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(edited);
  };

  const handleDelete = () => {
    onDelete(edited);
  };

  return (
    <Modal onClose={onClose}>
      <h3>Edit Dish</h3>
      <label>Name
        <input type="text" value={edited.name || ''} onChange={e => handleChange('name', e.target.value)} />
      </label>
      <label>Category
        <select value={edited.category || ''} onChange={e => handleChange('category', e.target.value)}>
          <option value="">Select Category</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </label>
      <label>Price
        <input type="number" value={edited.price || 0} onChange={e => handleChange('price', Number(e.target.value))} />
      </label>
      {/* recipe editing could go here in future */}
      <div className="modal-buttons">
        <button type="button" onClick={onClose}>Cancel</button>
        <button type="button" onClick={() => handleDelete()}>Delete</button>
        <button type="button" onClick={() => handleSave()}>Save</button>
      </div>
    </Modal>
  );
};

export default EditDishModal;
