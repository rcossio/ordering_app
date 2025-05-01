import React, { useState, useEffect } from 'react';
import OrdersList from './OrdersList/OrdersList';
import API from '../api';

const OrdersContainer = ({ userLanguage, onDelete }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    API.get('/user/orders')
      .then(res => setOrders(res.data))
      .catch(err => console.error('Error fetching orders:', err));
  }, []);

  return <OrdersList orders={orders} onDelete={onDelete} userLanguage={userLanguage} />;
};

export default OrdersContainer;