// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginForm from './pages/LoginForm';
import UserIdentification from './pages/userIdentification';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import HODDashboard from './pages/HODDashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserIdentification />} />
        <Route path="/login" element={<LoginForm />} /> {/* Ensure this route exists */}
        <Route path="/studentDashboard" element={<StudentDashboard />} />
        <Route path="/staffDashboard" element={<StaffDashboard />} />
        <Route path="/hodDashboard" element={<HODDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;

