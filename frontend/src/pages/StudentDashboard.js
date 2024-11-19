// src/pages/StudentDashboard.js
import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './StudentDashboard.css';
import axios from 'axios';

const StudentDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [proofUrl, setProofUrl] = useState(null);
  const [user, setUser] = useState(null);

  // Form state variables
  const [department, setDepartment] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [reason, setReason] = useState('');
  const [leavetype, setLeavetype] = useState('');
  const [proof, setProof] = useState(null);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('name', user.name);
    formData.append('rollNo', user.rollNo);
    formData.append('department', department);
    formData.append('yearOfStudy', yearOfStudy);
    formData.append('reason', reason);
    formData.append('proof', proof);
    formData.append('date', selectedDate.toISOString());
    formData.append('leavetype', leavetype);

    try {
      const response = await fetch('http://localhost:5000/api/leave-requests', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        alert('Leave request submitted successfully!');
        setDepartment('');
        setYearOfStudy('');
        setReason('');
        setProof(null);
        setLeavetype('');
        setShowForm(false);
        setSelectedDate(null);
        setProofUrl(result.proof);
      } else {
        alert(result.message || 'Error submitting leave request.');
      }
    } catch (err) {
      console.error('Request failed', err);
      alert('Error submitting leave request. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.status === 200) {
          setUser(response.data);
        } else {
          console.error('Failed to load user data.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        alert('Failed to load user data. Please try again.');
      }
    };
    fetchUserData();
  }, []);

  return (
    <div className="student-dashboard">
      <img src="/images/collegeLogo.png" alt="College Logo" className="login-logo_stud" />
      <h1 className="stud-text">Student Dashboard</h1>

      {user ? (
        <div className="stud-profile-card">
          <img src={`http://localhost:5000/${user.profileImage}`} alt="Profile" className="stud-profile-images" />
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Roll No:</strong> {user.rollNo}</p>
          <p><strong>Department:</strong> {user.department}</p>
          <p><strong>Year of Study:</strong> {user.yearOfStudy}</p>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}

      <div className="stud-Calender-div">
        <h3 className="stud-calendar-div-text">Select a date to submit a leave/OD request:</h3>
        <Calendar onChange={handleDateChange} value={selectedDate} />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="stud-leave-form">
          <h2>Leave/OD Request for {selectedDate && selectedDate.toDateString()}</h2>

          <label>Name: <input type="text" value={user.name} readOnly /></label>
          <label>Roll No: <input type="text" value={user.rollNo} readOnly /></label>

          <label>
            Department:
            <div>
              <input type="radio" name="department" value="ECE-A" onChange={(e) => setDepartment(e.target.value)} /> ECE-A
              <input type="radio" name="department" value="ECE-B" onChange={(e) => setDepartment(e.target.value)} /> ECE-B
              <input type="radio" name="department" value="ACT" onChange={(e) => setDepartment(e.target.value)} /> ACT
            </div>
          </label>

          <label>
            Year of Study:
            <div>
              <input type="radio" name="yearOfStudy" value="1st yr" onChange={(e) => setYearOfStudy(e.target.value)} /> 1st yr
              <input type="radio" name="yearOfStudy" value="2nd yr" onChange={(e) => setYearOfStudy(e.target.value)} /> 2nd yr
              <input type="radio" name="yearOfStudy" value="3rd yr" onChange={(e) => setYearOfStudy(e.target.value)} /> 3rd yr
            </div>
          </label>

          <label>
            Leave Type:
            <div>
              <input type="radio" name="leavetype" value="Sick Leave" onChange={(e) => setLeavetype(e.target.value)} /> Sick Leave
              <input type="radio" name="leavetype" value="Casual Leave" onChange={(e) => setLeavetype(e.target.value)} /> Casual Leave
              <input type="radio" name="leavetype" value="On-Duty" onChange={(e) => setLeavetype(e.target.value)} /> On-Duty
            </div>
          </label>
          <label>
          <label>
          Select Hours: 
<input
type="checkbox"

/>
Hour 1
<input
type="checkbox"

/>
Hour 2
<input
type="checkbox"

/>
Hour 3
<input
type="checkbox"

/>
Hour 4
<input
type="checkbox"

/>
Hour 5
<input
type="checkbox"

/>
Hour 6
<input
type="checkbox"

/>
Hour 7
<input
type="checkbox"

/>
Hour 8
</label>
</label>
          <label>Reason: <textarea value={reason} onChange={(e) => setReason(e.target.value)} required /></label>

          <label>Upload Proof (if any): <input type="file" onChange={(e) => setProof(e.target.files[0])} accept="application/pdf,image/*" /></label>

          <button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
        </form>
      )}

      {proofUrl && (
        <div>
          <h3>Proof uploaded:</h3>
          <a href={proofUrl} target="_blank" rel="noopener noreferrer">View Proof</a>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
