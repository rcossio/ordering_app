import React, { useState } from 'react';
import DishGrid from './DishGrid/DishGrid';
import CartContainer from './CartContainer';
import API from '../api';

const CashierContainer = ({ categories, categoryDishes, userLanguage }) => {
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [tip, setTip] = useState(0);

  const addToCart = (dish) => {
    setCart((prevCart) => {
      const existingDish = prevCart.find((item) => item._id === dish._id);
      if (existingDish) {
        return prevCart.map((item) =>
          item._id === dish._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...dish, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (dishId) => {
    setCart((prevCart) => {
      const existingDish = prevCart.find((item) => item._id === dishId);
      if (existingDish && existingDish.quantity > 1) {
        return prevCart.map((item) =>
          item._id === dishId ? { ...item, quantity: item.quantity - 1 } : item
        );
      } else {
        return prevCart.filter((item) => item._id !== dishId);
      }
    });
  };

  const confirmOrder = (cart, total, discount, tip) => {
    if (!cart.length) return alert('Cart is empty');
    if (!window.confirm('Confirm and save this order?')) return;
    API.post('/user/orders', { dishes: cart, total, discount, tip })
      .then(() => {
        alert('Order saved!');
      })
      .catch(err => {
        console.error('Error saving order:', err);
        alert('Failed to save order');
      });
  };

  return (
    <>
      <DishGrid
        categories={categories}
        categoryDishes={categoryDishes}
        onDishClick={addToCart}
        userLanguage={userLanguage}
      />
      <CartContainer
        cart={cart}
        onAddToCart={addToCart}
        onRemoveFromCart={removeFromCart}
        onConfirmOrder={confirmOrder}
        userLanguage={userLanguage}
        discount={discount}
        setDiscount={setDiscount}
        tip={tip}
        setTip={setTip}
      />
    </>
  );
};

export default CashierContainer;
