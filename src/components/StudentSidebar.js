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
        <li className="nav-item disabled">My Assignments</li>
        <li className="nav-item disabled">My Grades</li>
        <li className="nav-item disabled">Profile Settings</li>

        {/* لاگ آؤٹ کو یہاں بھی ایک لسٹ آئٹم بنا دیا گیا ہے */}
        <li className="nav-item nav-item-logout" onClick={onLogout}>
          Logout
        </li>
      </ul>
    </div>
  );
}

export default StudentSidebar;