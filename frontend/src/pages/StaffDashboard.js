import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './StaffDashboard.css';

const StaffDashboard = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        // Fetch leave requests with status 'Pending'
        const res = await axios.get(`http://localhost:5000/api/leave-requests`);
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

  const forwardToHOD = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/leave-requests/forward-to-hod/${id}`);
      alert('Leave request forwarded to HOD!');
      // Filter out the forwarded request from the list
      setLeaveRequests(leaveRequests.filter((request) => request._id !== id));
    } catch (error) {
      console.error('Error forwarding leave request:', error);
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
    <div className="staff-dashboard">
      <img src="/images/collegeLogo.png" alt="College Logo" className="login-logo_staff" />
      <h2 className="staff-text">Staff Dashboard</h2>

      {user && (
        <div className="profile-card">
          <img src={user.image} alt={`${user.name}'s profile`} className="profile-image" />
          <h3>Profile Details</h3>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Staff ID:</strong> {user.staffId}</p>
          <p><strong>Department:</strong> {user.department}</p>
          <p><strong>Role:</strong> Staff</p>
        </div>
      )}

      {leaveRequests.length === 0 ? (
        <p>No pending leave requests</p>
      ) : (
        leaveRequests.map((request) => (
          <div key={request._id} className="request-item">
            <p><strong>Name:</strong> {request.name}</p>
            <p><strong>Roll No:</strong> {request.rollNo}</p>
            <p><strong>Reason:</strong> {request.reason}</p>
            <p><strong>Date:</strong> {new Date(request.date).toLocaleDateString()}</p>
            <button onClick={() => forwardToHOD(request._id)}>Forward to HOD</button>
            <button onClick={() => rejectRequest(request._id)}>Reject</button>
          </div>
        ))
      )}
    </div>
  );
};

export default StaffDashboard;
