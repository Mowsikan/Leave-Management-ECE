// src/pages/UserIdentification.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './userIdentification.css';

const UserIdentification = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const handleUserSelect = (role) => {
    navigate(`/login/${role.toLowerCase()}`);
  };

  return (
    <motion.div 
      className="user-identification"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.img
        src="/images/collegeLogo.png"
        alt="MCET Logo"
        className="college-logo"
        variants={itemVariants}
      />

      <motion.div 
        className="welcome-section"
        variants={itemVariants}
      >
        <h1>Welcome to MCET OD Management System</h1>
        <p>Please select your designation to continue</p>
      </motion.div>

      <motion.div 
        className="user-options"
        variants={containerVariants}
      >
        {[
          {
            role: 'Student',
            icon: '/images/student.jpg',
            description: 'Submit and track OD requests'
          },
          {
            role: 'Staff',
            icon: '/images/staff.jpg',
            description: 'Manage student OD requests'
          },
          {
            role: 'HOD',
            icon: '/images/hod.jpg',
            description: 'Department OD management'
          }
        ].map((user) => (
          <motion.div
            key={user.role}
            className="user-option"
            variants={itemVariants}
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleUserSelect(user.role)}
          >
            <div className="option-content">
              <img src={user.icon} alt={user.role} />
              <h2>{user.role}</h2>
              <p>{user.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        className="footer"
        variants={itemVariants}
      >
        <p>© 2025 Dr. Mahalingam College of Engineering and Technology</p>
      </motion.div>
    </motion.div>
  );
};

export default UserIdentification;
