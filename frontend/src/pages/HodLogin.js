import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './LoginForm.css'; // Make sure to include your CSS
import axios from 'axios';

const HODLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/login', { username, password });
      const { user } = response.data;

      // Redirect based on role
      if (user.role === 'student') window.location.href = '/studentDashboard';
      else if (user.role === 'staff') window.location.href = '/staffDashboard';
      else if (user.role === 'HOD') window.location.href = '/hodDashboard';
    } catch (error) {
      setError(error.response ? error.response.data.message : 'Error logging in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left-panel">
        <motion.div 
          className="college-info"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3>Welcome to MCET</h3>
          <p>Department of Electronics and Communication Engineering</p>
          <div className="college-highlights">
            <div className="highlight-item">
              <span className="highlight-number">A+</span>
              <span className="highlight-text">NAAC Grade</span>
            </div>
            <div className="highlight-item">
              <span className="highlight-number">4.5/5</span>
              <span className="highlight-text">Student Rating</span>
            </div>
            <div className="highlight-item">
              <span className="highlight-number">95%</span>
              <span className="highlight-text">Placement</span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="login-form-container"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="login-header">
          <img src="/images/collegeLogo.png" alt="College Logo" className="login-logo" />
          <h2>HOD Login</h2>
        </div>

        {error && (
          <motion.div 
            className="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-with-icon">
              <i className="fas fa-user"></i>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <i className="fas fa-lock"></i>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            className="login-button"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              'Login'
            )}
          </motion.button>
        </form>

        <div className="login-footer">
          <p>Having trouble logging in? Contact your department coordinator</p>
          <Link to="/" className="back-to-home">
            ← Back to Home
          </Link>
        </div>

        <div className="help-section">
          <h4>Quick Help</h4>
          <div className="help-items">
            <div className="help-item">
              <i className="fas fa-info-circle"></i>
              <span>First time login? Use your staff ID as password</span>
            </div>
            <div className="help-item">
              <i className="fas fa-shield-alt"></i>
              <span>Keep your login credentials confidential</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HODLogin;
