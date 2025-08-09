import React from 'react';
import { Link } from 'react-router-dom'; // Link کو استعمال کریں گے
import './Dashboard.css';

// اس کا نام TeacherDashboardPage سے TeacherDashboard کر دیں
function TeacherDashboardPage() {
  return (
    <div className="dashboard-container">
      <h2>Teacher Dashboard</h2>
      <p>Welcome! Here you will see a summary of your classroom activities.</p>
      
      <div style={{ marginTop: '20px' }}>
        {/* ہم نے یہاں My Groups اور Manage Students کے لیے فوری لنکس شامل کیے ہیں */}
        <p>Quick Actions:</p>
        <Link to="/teacher-groups" style={{ marginRight: '10px' }}>
          <button className="auth-button">Manage My Groups</button>
        </Link>
        <Link to="/teacher-students">
          <button className="auth-button">Manage Students</button>
        </Link>
      </div>
    </div>
  );
}

export default TeacherDashboardPage;