import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ userType }) => {
    const navigate = useNavigate();
  
    const handleLogin = (e) => {
      e.preventDefault();
      
      // Add authentication logic here (this is just a placeholder)
      if (userType === 'student') {
        navigate('/student-dashboard');
      } else if (userType === 'staff') {
        navigate('/staff-dashboard');
      } else if (userType === 'hod') {
        navigate('/hod-dashboard');
      }
    };
  
    return (
      <div className="login-page">
        <h1>{`Login as ${userType.charAt(0).toUpperCase() + userType.slice(1)}`}</h1>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Username" required />
          <input type="password" placeholder="Password" required />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  };

  
export default LoginPage;
