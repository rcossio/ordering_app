import React, { useState, useRef, useEffect } from 'react';

const OrdersList = ({ orders, onDelete }) => {
  const [showDelete, setShowDelete] = useState({});
  const timers = useRef({});

  // Reset delete buttons when touching anywhere outside list items
  useEffect(() => {
    const handleDocumentInput = () => setShowDelete({});
    document.addEventListener('touchstart', handleDocumentInput);
    document.addEventListener('click', handleDocumentInput);
    return () => {
      document.removeEventListener('touchstart', handleDocumentInput);
      document.removeEventListener('click', handleDocumentInput);
    };
  }, []);

  const handlePressStart = id => {
    timers.current[id] = setTimeout(() => {
      setShowDelete(prev => ({ ...prev, [id]: true }));
    }, 500);
  };

  const handlePressEnd = id => {
    clearTimeout(timers.current[id]);
  };

  return (
    <div className="orders">
      <h2>Past Orders</h2>
      <ul className="orders-list">
        {orders.map((order, idx) => (
          <li
            key={order._id}
            className={`order-item ${idx % 2 === 0 ? 'light' : 'dark'}`}
            onTouchStart={e => {
              // Prevent document listener and toggle delete
              e.stopPropagation();
              if (showDelete[order._id]) {
                setShowDelete(prev => ({ ...prev, [order._id]: false }));
              } else {
                handlePressStart(order._id);
              }
            }}
            onTouchEnd={e => {
              if (!showDelete[order._id]) {
                handlePressEnd(order._id);
              }
            }}
            onClick={e => e.stopPropagation()}
          >
            <span>{new Date(order.createdAt).toLocaleString()} - <strong>${order.total.toFixed(2)}</strong></span>
            {showDelete[order._id] && (
              <button
                className="order-delete"
                onClick={() => onDelete(order._id)}
              >Delete</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrdersList;
