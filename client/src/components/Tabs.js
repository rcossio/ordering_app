import React from 'react';

const Tabs = ({ activeTab, setActiveTab }) => (
  <div className="tabs">
    <button type="button" onClick={() => setActiveTab('cashier')} disabled={activeTab === 'cashier'}>Cashier</button>
    <button type="button" onClick={() => setActiveTab('orders')} disabled={activeTab === 'orders'}>Orders</button>
    <button type="button" onClick={() => setActiveTab('manage')} disabled={activeTab === 'manage'}>Manage</button>
  </div>
);

export default Tabs;
