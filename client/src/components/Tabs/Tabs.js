import React from 'react';
import cashierIcon from '../icons/cashier.svg';
import ordersIcon from '../icons/orders.svg';
import manageIcon from '../icons/manage.svg';
import './Tabs.css';

const Tabs = ({ activeTab, setActiveTab }) => (
  <div className="tabs">
    <button type="button" onClick={() => setActiveTab('cashier')} disabled={activeTab === 'cashier'}>
      <img src={cashierIcon} alt="Cashier" />
      Cashier
    </button>
    <button type="button" onClick={() => setActiveTab('orders')} disabled={activeTab === 'orders'}>
      <img src={ordersIcon} alt="Orders" />
      Orders
    </button>
    <button type="button" onClick={() => setActiveTab('manage')} disabled={activeTab === 'manage'}>
      <img src={manageIcon} alt="Manage" />
      Manage
    </button>
  </div>
);

export default Tabs;
