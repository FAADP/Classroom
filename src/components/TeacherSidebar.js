import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

function TeacherSidebar({ onLogout }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>درس گاہ</h3>
      </div>
      <ul className="sidebar-nav">
        <NavLink to="/teacher-dashboard" className="nav-link"><li className="nav-item">Dashboard</li></NavLink>
        <NavLink to="/teacher-groups" className="nav-link"><li className="nav-item">My Groups</li></NavLink>
        <NavLink to="/teacher-students" className="nav-link"><li className="nav-item">Manage Students</li></NavLink>
        <NavLink to="/teacher-assignments" className="nav-link"><li className="nav-item">Assignments</li></NavLink>
        <NavLink to="/teacher-submissions" className="nav-link"><li className="nav-item">Submissions</li></NavLink>
        <NavLink to="/teacher-attendance" className="nav-link"><li className="nav-item">Attendance</li></NavLink>
        <NavLink to="/teacher-reports" className="nav-link"><li className="nav-item">Reports</li></NavLink>
        <NavLink to="/teacher-profile-settings" className="nav-link"><li className="nav-item">Profile Settings</li></NavLink>
        <li className="nav-item nav-item-logout" onClick={onLogout}>
          Logout
        </li>
      </ul>
    </div>
  );
}

export default TeacherSidebar;