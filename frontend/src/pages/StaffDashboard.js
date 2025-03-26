// src/pages/StaffDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { FaSignOutAlt } from 'react-icons/fa';
import './StaffDashboard.css';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StaffDashboard = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [user, setUser] = useState(null);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Fetch pending leave requests
    const fetchLeaveRequests = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/leave-requests');
        setLeaveRequests(res.data);
      } catch (error) {
        console.error('Error fetching leave requests:', error);
      }
    };

    // Fetch analytics data (e.g., leave requests by department)
    const fetchAnalyticsData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/leave-requests/analytics');
        const data = response.data;
        const departments = data.departmentData.map(item => item._id);
        const counts = data.departmentData.map(item => item.count);
        setChartData({
          labels: departments,
          datasets: [
            {
              label: 'OD Requests per Department',
              data: counts,
              backgroundColor: 'rgba(75,192,192,0.6)',
              borderColor: 'rgba(75,192,192,1)',
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      }
    };

    // Load staff user from localStorage (or fetch from an API)
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);

    fetchLeaveRequests();
    fetchAnalyticsData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login/staff';
  };

  const forwardToHOD = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/leave-requests/forward-to-hod/${id}`);
      alert('Leave request forwarded to HOD!');
      setLeaveRequests(leaveRequests.filter(request => request._id !== id));
    } catch (error) {
      console.error('Error forwarding leave request:', error);
    }
  };

  const rejectRequest = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/leave/reject/${id}`);
      alert('Request rejected.');
      setLeaveRequests(leaveRequests.filter(request => request._id !== id));
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* Navbar */}
      <nav className="dashboard-nav">
        <div className="nav-left">
          <img src="/images/collegeLogo.png" alt="College Logo" className="nav-logo" />
        </div>
        <div className="nav-middle">
          <h1>Staff Dashboard</h1>
        </div>
        <div className="nav-right">
          <div className="nav-menu">
            <span className="welcome-text">Welcome, {user?.name || 'Staff Member'}</span>
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard-container">
        {/* Profile Card */}
        <motion.div 
          className="profile-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="profile-card">
            <div className="profile-header">
              <img 
                src={user?.profileImage || '/images/staff.jpg'} 
                alt="Profile" 
                className="profile-image"
              />
              <div className="profile-details">
                <h2>{user?.name || 'Sivaranjani S'}</h2>
                <p className="staff-id">Staff ID: {user?.staffId || 'Staff123'}</p>
                <p className="department">Department: {user?.department || 'ECE-ACT'}</p>
                <p className="role">Role: {user?.role || 'Staff'}</p>
              </div>
            </div>
            <div className="leave-stats">
              <div className="stat-item">
                <span className="stat-value">10</span>
                <span className="stat-label">Total OD's</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">8</span>
                <span className="stat-label">Approved</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">2</span>
                <span className="stat-label">Pending</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Analytics & Requests Section */}
        <div className="analytics-requests-section">
          <div className="analytics-section">
            <h2>OD Analytics</h2>
            {chartData ? (
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'OD Requests by Department' },
                  },
                }}
              />
            ) : (
              <div>Loading chart...</div>
            )}
          </div>
          <div className="requests-section">
            <h2>Pending Leave Requests</h2>
            {leaveRequests.length === 0 ? (
              <p>No pending leave requests</p>
            ) : (
              leaveRequests.map((request) => (
                <div key={request._id} className="request-item">
                  <p><strong>Name:</strong> {request.name}</p>
                  <p><strong>Roll No:</strong> {request.rollNo}</p>
                  <p><strong>Reason:</strong> {request.reason}</p>
                  <p>
                    <strong>Date:</strong>{' '}
                    {new Date(request.date).toLocaleDateString()}
                  </p>
                  <p><strong>Type:</strong> {request.leavetype}</p>
                  <div className="button-group">
                    <button className="btn-forward" onClick={() => forwardToHOD(request._id)}>
                      Forward to HOD
                    </button>
                    <button className="btn-reject" onClick={() => rejectRequest(request._id)}>
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
