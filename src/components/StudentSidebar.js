import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

function StudentSidebar({ onLogout }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>درس گاہ</h3>
      </div>
      <ul className="sidebar-nav">
        <NavLink to="/student-dashboard" className="nav-link"><li className="nav-item">My Dashboard</li></NavLink>
        <NavLink to="/student-assignments" className="nav-link"><li className="nav-item">My Assignments</li></NavLink>
        <NavLink to="/student-grades" className="nav-link"><li className="nav-item">My Grades</li></NavLink>
        <NavLink to="/student-profile-settings" className="nav-link"><li className="nav-item">Profile Settings</li></NavLink>
        <li className="nav-item nav-item-logout" onClick={onLogout}>
          Logout
        </li>
      </ul>
    </div>
  );
}

export default StudentSidebar;