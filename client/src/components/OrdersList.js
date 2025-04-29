import React from 'react';

const OrdersList = ({ orders, onDelete }) => (
  <div className="orders">
    <h2>Past Orders</h2>
    <ul>
      {orders.map(order => (
        <li key={order._id}>
          {new Date(order.createdAt).toLocaleString()} - ${order.total.toFixed(2)}
          <button type="button" onClick={() => onDelete(order._id)}>Delete</button>
        </li>
      ))}
    </ul>
  </div>
);

export default OrdersList;
