import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './HODDashboard.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


const HODDashboard = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [user, setUser] = useState(null);
  const [chartData, setChartData] = useState(null);

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
    const fetchLeaveRequestData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/leave-requests/analytics');
        const data = await response.json();

        // Assuming you're grouping leave requests by department:
        const departments = data.departmentData.map((item) => item._id); // E.g., ['ECE-A', 'ECE-B', 'ACT']
        const leaveCounts = data.departmentData.map((item) => item.count); // E.g., [5, 3, 7]

        setChartData({
          labels: departments,
          datasets: [
            {
              label: 'Leave Requests per Department',
              data: leaveCounts,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        });
      } catch (err) {
        console.error('Error fetching leave request data', err);
      }
    };

    fetchLeaveRequestData();
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
if (!chartData) {
    return <div>Loading chart...</div>;
  }

  return (
    <div className="hod-dashboard">
      <img src="/images/collegeLogo.png" alt="College Logo" className="login-logo_hod" />
      <h2 className="hod-text">HOD Dashboard</h2>

      {user && (
        <div className="hod-profile-card">
          <img src="/images/hod.jpg" alt={`${user.name}'s profile`} className="hod-profile-image" />
          <h2>Profile Details</h2>
          <p><strong>Name:</strong> HOD</p>
          <p><strong>HOD ID:</strong> hod123</p>
          <p><strong>Department:</strong>ECE</p>
          <p><strong>Role:</strong> Head of Department (HOD)</p>
        </div>
      )}

<div className="hod-analytics-section">
      <h2>Leave Requests Analytics</h2>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Leave Requests by Department' },
          },
        }}
      />
    </div>
    <div className="hod-request-container">
      {leaveRequests.length === 0 ? (
        <p>No leave requests forwarded by staff</p>
      ) : (
        leaveRequests.map((request) => (
          <div key={request._id} className="hod-request-item">
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
    </div>
  );
};

export default HODDashboard;
