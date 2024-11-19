// src/pages/StudentLogin.js
import React, { useState } from 'react';
import './LoginForm.css'; // Make sure to include your CSS
import axios from 'axios';

const StaffLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post('http://localhost:5000/login', { username, password });
        const { user } = response.data;

        // Redirect based on role
        if (user.role === 'student') window.location.href = '/studentDashboard';
        else if (user.role === 'staff') window.location.href = '/staffDashboard';
        else if (user.role === 'HOD') window.location.href = '/hodDashboard';
    } catch (error) {
        setError(error.response ? error.response.data.message : 'Error logging in');
    }
};

  return (
    <div className="login-form">
    <img src="/images/collegeLogo.png" alt="College Logo" className="login-logo" />
    <h2>Staff Login</h2>
    {error && <p className="error-message">{error}</p>}
    <form onSubmit={handleLogin}>
      <label htmlFor="username">Username</label>
      <input
        type="text"
        id="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <label htmlFor="password">Password</label>
      <input
        type="password"
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Login</button>
    </form>
  </div>
  
  );
}
export default StaffLogin;

