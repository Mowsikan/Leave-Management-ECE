import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css'; // Make sure to include your CSS


const users = [
  { username: 'hod', password: 'hod123', role: 'hod', name: 'Dr. Sudhakar', hodId: 'HOD001', department: 'ECE', image: '/images/hod.png' },
];


const HODLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
      e.preventDefault();
      console.log("Attempting to log in:", username); // Debugging line

      const user = users.find((u) => u.username === username && u.password === password);
      console.log("Found user:", user); // Debugging line

      if (user) {
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
          const userData = { 
            name: user.name, 
            hodId: user.hodId, 
            department: user.department, 
            image: user.image, 
            role: user.role 
          };
          localStorage.setItem('user', JSON.stringify(userData));
          
      } else {
          setError('Invalid username or password. Please try again.');
      }

      try {
          const response = await fetch(`http://localhost:5000/api/login`, {
              method: 'POST',
              body: JSON.stringify({ username, password }),
              headers: {
                  'Content-Type': 'application/json',
              },
          });

          const data = await response.json();
          if (data.token) {
              localStorage.setItem('token', data.token);
              localStorage.setItem('user', JSON.stringify(data.user));
              navigate('/studentDashboard');
          }
      } catch (error) {
          console.error('Login failed', error);
      }
  };

  return (
    <div className="login-form">
    <img src="/images/collegeLogo.png" alt="College Logo" className="login-logo" />
    <h2>HOD Login</h2>
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
export default HODLogin;
