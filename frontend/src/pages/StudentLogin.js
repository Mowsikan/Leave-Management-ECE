// src/pages/StudentLogin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css'; // Make sure to include your CSS

// Simulated user database
const users = [
  { username: 'Yashwanth', password: 'student123', rollNo: '12345', department: 'ECE-A', year: '2nd yr', role: 'student' },
  { username: 'Mowsikan.H', password: '08052006', rollNo: '727623BEA030', department: 'ACT', year: '2nd yr', role: 'student' },
  { username: 'Vicky', password: '08052006', rollNo: '123456', department: 'ECE-B', year: '3rd yr', role: 'student' },
];

const StudentLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Attempting to log in:", username);

    // Find the user based on the username and password
    const user = users.find((u) => u.username === username && u.password === password);

    if (user) {
      // Store the user details in localStorage for future access
      const userData = {
        name: user.username,
        rollNo: user.rollNo,
        department: user.department,
        year: user.year
      };
      localStorage.setItem('user', JSON.stringify(userData));

      navigate('/studentDashboard'); // Redirect to student dashboard after login
    } else {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div className="login-form">
      <img src="/images/collegeLogo.png" alt="College Logo" className="login-logo" />
      <h2>Student Login</h2>
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

export default StudentLogin;
