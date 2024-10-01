import React, { useEffect, useState } from 'react';
import axios from 'axios';

const HODDashboard = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const res = await axios.get('/api/leave-requests?status=Forwarded to HOD');
        setLeaveRequests(res.data);
      } catch (error) {
        console.error('Error fetching leave requests:', error);
      }
    };
    fetchLeaveRequests();
  }, []);

 // Fetch the leave requests from the server when the component mounts
 useEffect(() => {
  fetch('/api/leave-requests')
    .then((response) => response.json())
    .then((data) => {
      setLeaveRequests(data);  // Store the leave requests in state
    })
    .catch((error) => {
      console.error('Error fetching leave requests:', error);
    });
}, []);

  const acceptRequest = async (id) => {
    try {
      await axios.put(`/api/accept-leave/${id}`);
      alert('Leave request approved!');
      setLeaveRequests(leaveRequests.filter((request) => request._id !== id)); // Remove request from HOD dashboard
    } catch (error) {
      console.error('Error approving leave request:', error);
    }
  };

  // Reject the request and update the UI
const rejectRequest = (id) => {
  fetch(`/api/leave/reject/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      alert('Request rejected.');
      // Update the leaveRequests state by removing the rejected request
      setLeaveRequests(leaveRequests.filter((request) => request._id !== id));
    })
    .catch((error) => {
      console.error('Error rejecting request:', error);
    });
};


  return (
    <div>
      <h2>HOD Dashboard</h2>
      {leaveRequests.length === 0 ? (
        <p>No leave requests forwarded</p>
      ) : (
        leaveRequests.map((request) => (
          <div key={request._id}>
            <p>Name: {request.name}</p>
            <p>Roll No: {request.rollNo}</p>
            <p>Reason: {request.reason}</p>
            <p>Date: {new Date(request.date).toLocaleDateString()}</p>
            <button onClick={() => acceptRequest(request._id)}>Accept</button>
            <button onClick={() => rejectRequest(request._id)}>Reject</button>
          </div>
        ))
      )}
    </div>
  );
};

export default HODDashboard;
