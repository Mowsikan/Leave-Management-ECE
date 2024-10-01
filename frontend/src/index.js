// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';  // Optional if you have global styles
import App from './App';  // Assuming App.js is your main component

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
