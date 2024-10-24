import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './StaffDashboard.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StaffDashboard = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [user, setUser] = useState(null);
  const [chartData, setChartData] = useState(null);

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

  if (!chartData) {
    return <div>Loading chart...</div>;
  }

  return (
    <div className="staff-dashboard">
      <img src="/images/collegeLogo.png" alt="College Logo" className="login-logo_staff" />
      <h2 className="staff-text">Staff Dashboard</h2>

      {user && (
        <div className="profile-card">
          <img src={user.image} alt={`${user.name}'s profile`} className="profile-image" />
          <h2>Profile Details</h2>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Staff ID:</strong> {user.staffId}</p>
          <p><strong>Department:</strong> {user.department}</p>
          <p><strong>Role:</strong> Staff</p>
        </div>
      )}

      <div className="analytics-section">
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

      <div className="request-container">
        {leaveRequests.length === 0 ? (
          <p>No pending leave requests</p>
        ) : (
          leaveRequests.map((request) => (
            <div key={request._id} className="request-item">
              <p><strong>Name:</strong> {request.name}</p>
              <p><strong>Roll No:</strong> {request.rollNo}</p>
              <p><strong>Reason:</strong> {request.reason}</p>
              <p><strong>Date:</strong> {new Date(request.date).toLocaleDateString()}</p>
              <p><strong>Leave-Type:</strong>{request.leavetype}</p>
              <button onClick={() => forwardToHOD(request._id)}>Forward to HOD</button>
              <button onClick={() => rejectRequest(request._id)}>Reject</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
