import React from 'react';
import texts from '../Texts';
import './Cart.css';

const Cart = ({ cart, subtotal, discount, tip, onRemove, onDiscountChange, onTipChange, onConfirm, userLanguage }) => (
  <div className="cart">
    <h2>{texts[userLanguage]?.texts.cart || texts['en'].texts.cart}</h2>
    <ul>
      {cart.map(item => (
        <li key={item._id}>
          <span>{item.name} x {item.quantity}</span>
          <button type="button" onClick={() => onRemove(item._id)}>-</button>
        </li>
      ))}
    </ul>
    <p>Subtotal: ${subtotal.toFixed(2)}</p>
    <div className="discount-tip-group">
      <label>
        Discount
        <input
          type="number"
          placeholder="0"
          value={discount}
          onChange={e => onDiscountChange(Number(e.target.value))}
        />
      </label>
      <label>
        Tip
        <input
          type="number"
          placeholder="0"
          value={tip}
          onChange={e => onTipChange(Number(e.target.value))}
        />
      </label>
    </div>
    <p>Total: ${(subtotal - discount + tip).toFixed(2)}</p>
    <button type="button" onClick={onConfirm}>Confirm Order</button>
  </div>
);

export default Cart;
