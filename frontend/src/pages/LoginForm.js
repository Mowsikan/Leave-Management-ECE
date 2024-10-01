// src/pages/LoginForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css'; // Make sure to include your CSS

const users = [
    { username: 'student', password: 'student123', role: 'student' },
    { username: 'staff', password: 'staff123', role: 'staff' },
    { username: 'hod', password: 'hod123', role: 'hod' },
    { username: 'mowsikan', password: '08052006', role: 'student' },
];

const LoginForm = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Attempting to log in:", username); // Debugging line

    // Check for valid username and password
    const user = users.find((u) => u.username === username && u.password === password);
    console.log("Found user:", user); // Debugging line

    if (user) {
      // Navigate to the respective dashboard based on user role
      switch (user.role) {
        case 'student':
          navigate('/studentDashboard');
          break;
        case 'staff':
          navigate('/staffDashboard');
          break;
        case 'hod':
          navigate('/hodDashboard');
          break;
        default:
          break;
      }
    } else {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div className="login-form">
      <h2>Login</h2>
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
};

export default LoginForm;
