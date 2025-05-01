import React, { useState } from 'react';
import texts from './Texts';

const CreateCategoryForm = ({ onCreate, userLanguage }) => {
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return alert('Category name is required');
    onCreate(name.trim());
    setName('');
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
      <button type="button" onClick={handleCreate}>Create Category</button>
    </div>
  );
};

const CategoryManager = CreateCategoryForm;
export default CategoryManager;