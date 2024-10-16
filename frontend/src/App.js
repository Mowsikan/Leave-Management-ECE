// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UserIdentification from './pages/userIdentification';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import HODDashboard from './pages/HODDashboard';
import StudentLogin from './pages/StudentLogin';
import StaffLogin from './pages/StaffLogin';
import HODLogin from './pages/HodLogin';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserIdentification />} />
        <Route path="/studentDashboard" element={<StudentDashboard />} />
        <Route path="/staffDashboard" element={<StaffDashboard />} />
        <Route path="/hodDashboard" element={<HODDashboard />} />
        <Route path="/login/student" element={<StudentLogin />} />
        <Route path="/login/staff" element={<StaffLogin />} />
        <Route path="/login/hod" element={<HODLogin />} />
      </Routes>
    </Router>
  );
};

export default App;

