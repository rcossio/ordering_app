import React, { useState } from 'react';
import API from '../../api';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    API.get(`/auth/user/${username}`)
      .then((response) => {
        if (response.data) {
          onLoginSuccess(username);
        } else {
          alert('Invalid username or password.');
        }
      })
      .catch((error) => {
        console.error('Error during login:', error);
        alert('Failed to login. Please try again.');
      });
  };

  return (
    <div className="login-page">
      <h1>Ordering App</h1>
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;