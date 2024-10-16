// src/pages/StudentDashboard.js
import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  // Form state variables
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [department, setDepartment] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [reason, setReason] = useState('');
  const [proof, setProof] = useState(null);
  
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setShowForm(true);  // Show form when a date is selected
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create a FormData object for the request
    const formData = new FormData();
    formData.append('name', name);
    formData.append('rollNo', rollNo);
    formData.append('department', department);
    formData.append('yearOfStudy', yearOfStudy);
    formData.append('reason', reason);
    formData.append('proof', proof); // File input
    formData.append('date', selectedDate);

    try {
      const response = await fetch('http://localhost:5000/api/leave-requests', {
        method: 'POST',
        body: formData,  // We don't use JSON.stringify for FormData
      });

      if (response.ok) {
        alert('Leave request submitted successfully!');
        // Clear form fields after successful submission
        setName('');
        setRollNo('');
        setDepartment('');
        setYearOfStudy('');
        setReason('');
        setProof(null);
        setShowForm(false); // Hide the form after submission
        setSelectedDate(null); // Clear the selected date
      } else {
        const result = await response.json();
        alert(result.message || 'Error submitting leave request.');
      }
    } catch (err) {
      console.error('Request failed', err);
      alert('Error submitting leave request. Please try again later.');
    }
  };

  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser); // Set the user details from localStorage
  }, []);

  return (
    <div className="student-dashboard">
      <img src="/images/collegeLogo.png" alt="College Logo" className="login-logo_stud" />
      <h1>Student Dashboard</h1>

      {user && (
        <div className="profile-card">
          <h2>Profile Details</h2>
          <img src="/images/mowsikan02.png" alt="mowsikan" className="profile-images"/>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Roll No:</strong> {user.rollNo}</p>
          <p><strong>Department:</strong> {user.department}</p>
          <p><strong>Year:</strong> {user.year}</p>
        </div>
      )}

      <div>
        <h3>Select a date to submit a leave/OD request:</h3>
        <Calendar onChange={handleDateChange} value={selectedDate} />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="leave-form">
          <h2>Leave/OD Request for {selectedDate && selectedDate.toDateString()}</h2>
          
          <label>
            Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label>
            Roll No:
            <input
              type="text"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              required
            />
          </label>

          <label>
            Department:
            <input
              type="radio"
              name="department"
              value="ECE-A"
              onChange={(e) => setDepartment(e.target.value)}
            /> ECE-A
            <input
              type="radio"
              name="department"
              value="ECE-B"
              onChange={(e) => setDepartment(e.target.value)}
            /> ECE-B
            <input
              type="radio"
              name="department"
              value="ACT"
              onChange={(e) => setDepartment(e.target.value)}
            /> ACT
          </label>

          <label>
            Year of Study:
            <input
              type="radio"
              name="yearOfStudy"
              value="1st yr"
              onChange={(e) => setYearOfStudy(e.target.value)}
            /> 1st yr
            <input
              type="radio"
              name="yearOfStudy"
              value="2nd yr"
              onChange={(e) => setYearOfStudy(e.target.value)}
            /> 2nd yr
            <input
              type="radio"
              name="yearOfStudy"
              value="3rd yr"
              onChange={(e) => setYearOfStudy(e.target.value)}
            /> 3rd yr
          </label>

          <label>
            Reason for leave/OD:
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </label>

          <label>
            Proof (optional):
            <input
              type="file"
              onChange={(e) => setProof(e.target.files[0])} // File handling
            />
          </label>

          <button type="submit">Submit Leave Request</button>
        </form>
      )}
    </div>
  );
};

export default StudentDashboard;
