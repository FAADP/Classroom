import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App'
import LoginPage from './pages/LoginPage.js'
import TeacherDashboardPage from './pages/TeacherDashboardPage.js'
import StudentDashboardPage from './pages/StudentDashboardPage.js'
import MyGroupsPage from './pages/MyGroupsPage.js';
import ManageStudentsPage from './pages/ManageStudentsPage.js';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'teacher-dashboard',
        element: <TeacherDashboardPage />,
      },
      {
        path: 'student-dashboard',
        element: <StudentDashboardPage />,
      },
      {
        path: 'teacher-groups', // نیا راستہ
        element: <MyGroupsPage />
      },
      {
        path: 'teacher-students', // نیا راستہ
        element: <ManageStudentsPage />
      }
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
])

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)