import React, { useState, useEffect } from 'react';
import OrdersList from './OrdersList/OrdersList';
import API from '../api';

const OrdersContainer = ({ userLanguage }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    API.get('/user/orders')
      .then(res => setOrders(res.data))
      .catch(err => console.error('Error fetching orders:', err));
  }, []);

  const deleteOrder = (orderId) => {
    if (!window.confirm('Delete this order?')) return;
    API.delete(`/user/orders/${orderId}`)
      .then(() => setOrders(orders.filter(order => order._id !== orderId)))
      .catch(err => console.error('Error deleting order:', err));
  };

  return <OrdersList orders={orders} onDelete={deleteOrder} userLanguage={userLanguage} />;
};

export default OrdersContainer;