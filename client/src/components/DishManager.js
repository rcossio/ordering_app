import React from 'react';
import DishForm from './DishForm';
import DishGrid from './DishGrid';

const DishManager = ({
  newDish,
  categories,
  ingredients,
  categoryDishes,
  onChange,
  onAddIngredient,
  onUpdateIngredient,
  onRemoveIngredient,
  onCreate,
  onDishClick
}) => (
  <div className="dish-manager">
    <DishForm
      newDish={newDish}
      categories={categories}
      ingredients={ingredients}
      onChange={onChange}
      onAddIngredient={onAddIngredient}
      onUpdateIngredient={onUpdateIngredient}
      onRemoveIngredient={onRemoveIngredient}
      onCreate={onCreate}
    />
    <DishGrid
      categories={categories}
      categoryDishes={categoryDishes}
      onDishClick={onDishClick}
    />
  </div>
);

export default DishManager;