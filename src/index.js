import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './App';
import LoginPage from './pages/LoginPage.js';
import TeacherDashboardPage from './pages/TeacherDashboardPage.js';
import StudentDashboardPage from './pages/StudentDashboardPage.js';
import MyGroupsPage from './pages/MyGroupsPage.js';
import ManageStudentsPage from './pages/ManageStudentsPage.js';
import AssignmentsPage from './pages/AssignmentsPage.js';
import ProfileSettingsPage from './pages/ProfileSettingsPage.js';
import StudentProfilePage from './pages/StudentProfilePage.js';
import StudentAssignmentsPage from './pages/StudentAssignmentsPage.js';
import SubmissionsPage from './pages/SubmissionsPage.js';
import MyGradesPage from './pages/MyGradesPage.js';
import AttendancePage from './pages/AttendancePage.js'; // نیا صفحہ امپورٹ کریں
import ReportsPage from './pages/ReportsPage.js'; // نیا صفحہ امپورٹ کریں

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: 'teacher-dashboard', element: <TeacherDashboardPage /> },
      { path: 'student-dashboard', element: <StudentDashboardPage /> },
      { path: 'teacher-groups', element: <MyGroupsPage /> },
      { path: 'teacher-students', element: <ManageStudentsPage /> },
      { path: 'teacher-assignments', element: <AssignmentsPage /> },
      { path: 'teacher-submissions', element: <SubmissionsPage /> },
      { path: 'teacher-profile-settings', element: <ProfileSettingsPage /> },
      { path: 'student-profile-settings', element: <StudentProfilePage /> },
      { path: 'student-assignments', element: <StudentAssignmentsPage /> },
      { path: 'student-grades', element: <MyGradesPage /> },
      { path: 'teacher-attendance', element: <AttendancePage /> }, // نیا راستہ
      { path: 'teacher-reports', element: <ReportsPage /> } // نیا راستہ
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);