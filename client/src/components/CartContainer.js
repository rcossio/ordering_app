import React, { useState } from 'react';
import Cart from './Cart/Cart';

const CartContainer = ({ cart, onAddToCart, onRemoveFromCart, onConfirmOrder, userLanguage }) => {
  const [discount, setDiscount] = useState(0);
  const [tip, setTip] = useState(0);

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.quantity * (item.price || 0), 0);
  };

  return (
    <Cart
      cart={cart}
      subtotal={calculateTotal()}
      discount={discount}
      tip={tip}
      onRemove={onRemoveFromCart}
      onDiscountChange={setDiscount}
      onTipChange={setTip}
      onConfirm={() => onConfirmOrder(cart, calculateTotal(), discount, tip)}
      userLanguage={userLanguage}
    />
  );
};

export default CartContainer;