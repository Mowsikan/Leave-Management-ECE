// src/pages/UserIdentification.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './userIdentification.css'; // Ensure you have this CSS file

const UserIdentification = () => {
  const navigate = useNavigate();

  const handleUserClick = (designation) => {
    navigate('/login', { state: { designation } });
  };

  return (
    <div className="user-identification">
      <h1>Select Your Designation</h1>
      <div className="user-options">
        <div className="user-option" onClick={() => handleUserClick('student')}>
          <img src="/images/student.jpg" alt="Student" />
          <p>Student</p>
        </div>
        <div className="user-option" onClick={() => handleUserClick('staff')}>
          <img src="/images/staff.jpg" alt="Staff" />
          <p>Staff</p>
        </div>
        <div className="user-option" onClick={() => handleUserClick('hod')}>
          <img src="/images/hod.jpg" alt="HOD" />
          <p>HOD</p>
        </div>
      </div>
    </div>
  );
};

export default UserIdentification;
