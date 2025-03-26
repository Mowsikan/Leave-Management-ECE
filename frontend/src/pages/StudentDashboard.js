import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaUserCircle, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import './StudentDashboard.css';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const StudentDashboard = () => {
  // Existing states
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [file, setFile] = useState(null);

  // New states for form fields
  const [departmentValue, setDepartmentValue] = useState('');
  const [reasonValue, setReasonValue] = useState('');

  // Add state at the top with other states
  const [selectedHours, setSelectedHours] = useState([]);
  const [isFullDay, setIsFullDay] = useState(false);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login/student';
  };

  const formatDate = (date) => {
    if (!date) return '';
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[date.getDay()];
    return `${dayName} ${date.toLocaleDateString()}`;
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowForm(true);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Helper function: Convert file to Base64 string
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Add handler functions
  const handleHourChange = (hour) => (e) => {
    const checked = e.target.checked;
    setSelectedHours(prev => 
      checked ? [...prev, hour] : prev.filter(h => h !== hour)
    );
  };

  const handleFullDayChange = (e) => {
    const fullDayChecked = e.target.checked;
    setIsFullDay(fullDayChecked);
    setSelectedHours(fullDayChecked ? [1,2,3,4,5,6,7,8] : []);
  };

  // Updated handleSubmit to send data to /submit-leave route
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Convert file (if provided) to Base64
      const proofData = file ? await convertFileToBase64(file) : '';

      // Prepare the payload
      const payload = {
        studentName: user?.name,             // From logged in user
        rollNo: user?.rollNo,                // From logged in user
        department: departmentValue,         // Selected from the form
        year: user?.yearOfStudy,             // From logged in user
        reason: reasonValue,                 // From the form textarea
        proof: proofData                     // Base64 string if file provided, else empty string
      };

      // Send POST request to /submit-leave
      const response = await axios.post('http://localhost:5000/submit-leave', payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      alert(response.data.message);
      // Optionally reset form fields:
      setDepartmentValue('');
      setReasonValue('');
      setFile(null);
      setShowForm(false);
      setSelectedDate(null);
    } catch (error) {
      console.error('Error submitting leave request:', error);
      alert('Error submitting leave request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* Navigation Bar */}
      <nav className="dashboard-nav">
        <div className="nav-left">
          <img src="/images/collegeLogo.png" alt="MCET Logo" className="nav-logo" />
        </div>
        <div className="nav-middle">
          <h1>Student Dashboard</h1>
        </div>
        <div className="nav-right">
          <div className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
            <span className="welcome-text">Welcome, {user?.name}</span>
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard-container">
        {/* Profile Section */}
        <motion.div 
          className="profile-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="profile-card">
            <div className="profile-header">
              <img 
                src={user?.profileImage || '/images/default-avatar.png'} 
                alt="Profile" 
                className="profile-image"
              />
              <div className="profile-details">
                <h2>{user?.name}</h2>
                <p className="roll-no">Roll No: {user?.rollNo}</p>
                <p className="department">Department: {user?.department}</p>
                <p className="year">Year of Study: {user?.yearOfStudy}</p>
              </div>
            </div>
            <div className="leave-stats">
              <div className="stat-item">
                <span className="stat-value">10</span>
                <span className="stat-label">Total OD's</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">2</span>
                <span className="stat-label">Approved</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">1</span>
                <span className="stat-label">Pending</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Calendar Section */}
        <div className="main-content">
          <div className="stud-calendar-section">
            <h3 className="stud-calendar-div-text">
              Select a date to submit an OD request:
            </h3>
            <div className="stud-calendar-div">
              <Calendar
                onChange={handleDateClick}
                value={selectedDate}
                minDate={new Date()}
                className="react-calendar"
              />
            </div>
          </div>

          {/* Leave Request Form */}
          {showForm && (
            <motion.div 
              className="stud-leave-form-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="stud-leave-form">
                <div className="form-header">
                  <h2>OD Request Form</h2>
                  <p className="selected-date">for {formatDate(selectedDate)}</p>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Department</label>
                    <select 
                      required 
                      value={departmentValue} 
                      onChange={(e) => setDepartmentValue(e.target.value)}
                    >
                      <option value="">Select Department</option>
                      <option value="ECE-A">ECE-A</option>
                      <option value="ECE-B">ECE-B</option>
                      <option value="ACT">ACT</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Select Hours</label>
                    <div className="hours-selection">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((hour) => (
                        <label key={hour} className="hour-checkbox">
                          <input
                            type="checkbox"
                            value={hour}
                            checked={selectedHours.includes(hour)}
                            onChange={handleHourChange(hour)}
                          />
                          Hour {hour}
                        </label>
                      ))}
                    </div>
                    <div className="day-type-selection">
                      <label className="day-type-option">
                        <input
                          type="checkbox"
                          checked={isFullDay}
                          onChange={handleFullDayChange}
                        />
                        Full Day
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Reason for OD</label>
                    <textarea 
                      required 
                      rows="4" 
                      value={reasonValue} 
                      onChange={(e) => setReasonValue(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label>Upload Supporting Document:</label>
                    <input type="file" onChange={handleFileChange} />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={loading}>
                      {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
