// src/context/NotificationContext.js
import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message) => {
    setNotifications((prev) => [...prev, message]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((_, index) => index !== 0));
    }, 3000); // Automatically remove notification after 3 seconds
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification }}>
      {children}
      <NotificationList notifications={notifications} />
    </NotificationContext.Provider>
  );
};

// Notification List Component
const NotificationList = ({ notifications }) => {
  return (
    <div className="notification-container">
      {notifications.map((note, index) => (
        <div key={index} className="notification">
          {note}
        </div>
      ))}
    </div>
  );
};
