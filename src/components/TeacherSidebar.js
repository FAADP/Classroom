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
        
        <li className="nav-item disabled">Assignments</li>
        <li className="nav-item disabled">Submissions</li>
        <li className="nav-item disabled">Attendance</li>
        <li className="nav-item disabled">Reports</li>
        <li className="nav-item disabled">Profile Settings</li>

        {/* لاگ آؤٹ کو یہاں ایک لسٹ آئٹم بنا دیا گیا ہے */}
        <li className="nav-item nav-item-logout" onClick={onLogout}>
          Logout
        </li>
      </ul>
      {/* logout-section کو یہاں سے ہٹا دیا گیا ہے */}
    </div>
  );
}

export default TeacherSidebar;