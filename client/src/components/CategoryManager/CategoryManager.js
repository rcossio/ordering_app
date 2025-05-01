import React, { useState } from 'react';
import texts from '../Texts';
import API from '../../api';
import './CategoryManager.css';

const CategoryManager = ({ userLanguage, onCategoryCreated }) => {
  const [name, setName] = useState('');

  const createCategory = () => {
    if (!name.trim()) return alert('Category name is required');
    API.post('/user/categories', { name: name.trim() })
      .then(response => {
        alert('Category created successfully!');
        setName('');
        if (onCategoryCreated) onCategoryCreated(response.data);
      })
      .catch(error => {
        console.error('Error creating category:', error);
        alert('Failed to create category.');
      });
  };

  return (
    <div className="create-category">
      <h2>{texts[userLanguage]?.createCategory || texts['en'].createCategory}</h2>
      <input
        type="text"
        placeholder="Category Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <button type="button" onClick={createCategory}>Create Category</button>
    </div>
  );
};

export default CategoryManager;