import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './HODDashboard.css';

const HODDashboard = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [user, setUser] = useState(null);

   useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        // Fetch leave requests with status 'Pending'
        const res = await axios.get(`http://localhost:5000/api/leave-requests/hod`);
        setLeaveRequests(res.data);
      } catch (error) {
        console.error('Error fetching leave requests:', error);
      }
    };
    fetchLeaveRequests();

    // Load user profile from localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
  }, []);

  const acceptRequest = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/accept-leave/${id}`);
      alert('Leave request accepted!');
      setLeaveRequests(leaveRequests.filter((request) => request._id !== id));
    } catch (error) {
      console.error('Error accepting leave request:', error);
    }
  };

  const rejectRequest = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/leave/reject/${id}`);
      alert('Request rejected.');
      setLeaveRequests(leaveRequests.filter((request) => request._id !== id));
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  return (
    <div className="hod-dashboard">
      <img src="/images/collegeLogo.png" alt="College Logo" className="login-logo_hod" />
      <h2 className="hod-text">HOD Dashboard</h2>

      {user && (
        <div className="profile-card">
          <img src={user.image} alt={`${user.name}'s profile`} className="profile-image" />
          <h3>Profile Details</h3>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>HOD ID:</strong> {user.hodId}</p>
          <p><strong>Department:</strong> {user.department}</p>
          <p><strong>Role:</strong> Head of Department (HOD)</p>
        </div>
      )}

      {leaveRequests.length === 0 ? (
        <p>No leave requests forwarded by staff</p>
      ) : (
        leaveRequests.map((request) => (
          <div key={request._id} className="request-item">
            <p><strong>Name:</strong> {request.name}</p>
            <p><strong>Roll No:</strong> {request.rollNo}</p>
            <p><strong>Reason:</strong> {request.reason}</p>
            <p><strong>Date:</strong> {new Date(request.date).toLocaleDateString()}</p>
            <button onClick={() => acceptRequest(request._id)}>Accept</button>
            <button onClick={() => rejectRequest(request._id)}>Reject</button>
          </div>
        ))
      )}
    </div>
  );
};

export default HODDashboard;
