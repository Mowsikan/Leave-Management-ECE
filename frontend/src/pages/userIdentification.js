// src/pages/UserIdentification.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './userIdentification.css'; // Ensure you have this CSS file

const UserIdentification = () => {
  const navigate = useNavigate();

  // Modify the handleUserClick to navigate to respective login pages
  const handleUserClick = (designation) => {
    switch (designation) {
      case 'student':
        navigate('/login/student');
        break;
      case 'staff':
        navigate('/login/staff');
        break;
      case 'hod':
        navigate('/login/hod');
        break;
      default:
        navigate('/login'); // Default in case designation is not provided
    }
  };

  return (
    <div className="user-identification">
      <img src="/images/collegeLogo.png" alt="logo" className="logo-useridentification" />
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
