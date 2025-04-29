import React, { useState } from 'react';

const CreateCategoryForm = ({ onCreate }) => {
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return alert('Category name is required');
    onCreate(name.trim());
    setName('');
  };

  return (
    <div className="create-category">
      <h2>Create Category</h2>
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

export default CreateCategoryForm;