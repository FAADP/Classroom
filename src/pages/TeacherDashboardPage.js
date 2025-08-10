import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Dashboard.css';
// چارٹ لائبریری سے ضروری چیزیں امپورٹ کریں
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

// چارٹ کے لیے کمپوننٹس کو رجسٹر کریں
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function TeacherDashboardPage() {
  const [loading, setLoading] = useState(true);
  // کارڈز کے لیے اسٹیٹس
  const [groupCount, setGroupCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [gradedCount, setGradedCount] = useState(0);
  
  // چارٹس کے لیے اسٹیٹس
  const [barChartData, setBarChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    async function fetchDashboardData() {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // --- کارڈز کا ڈیٹا ---
        const { count: groupsCount } = await supabase.from('groups').select('*', { count: 'exact', head: true }).eq('teacher_id', user.id);
        setGroupCount(groupsCount || 0);

        const { count: studentsCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
        setStudentCount(studentsCount || 0);
        
        const { count: submissionsCount } = await supabase.from('submissions').select('*', { count: 'exact', head: true });
        setSubmissionCount(submissionsCount || 0);

        const { count: graded } = await supabase.from('submissions').select('*', { count: 'exact', head: true }).not('grade', 'is', null);
        setGradedCount(graded || 0);
        
        // --- بار چارٹ کا ڈیٹا (نیا، قابل اعتماد طریقہ) ---
        const { data: groups } = await supabase.from('groups').select('id, name').eq('teacher_id', user.id);
        const { data: students } = await supabase.from('profiles').select('group_id').eq('role', 'student');

        if (groups && students) {
          const groupCounts = groups.map(group => ({
            name: group.name,
            count: students.filter(student => student.group_id === group.id).length
          }));
          
          setBarChartData({
            labels: groupCounts.map(g => g.name),
            datasets: [{
              label: 'Number of Students',
              data: groupCounts.map(g => g.count),
              backgroundColor: '#600000',
            }]
          });
        }
      }
      setLoading(false);
    }
    fetchDashboardData();
  }, []);

  // ڈونٹ چارٹ کا ڈیٹا
  const doughnutData = {
    labels: ['Graded', 'Pending'],
    datasets: [
      {
        label: 'Submissions',
        data: [gradedCount, submissionCount - gradedCount],
        backgroundColor: ['#28a745', '#ffc107'],
        borderColor: ['#ffffff', '#ffffff'],
        borderWidth: 2,
      },
    ],
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <h2>Teacher Dashboard</h2>
      
      <div className="summary-cards-container">
        <div className="summary-card"><h3>Total Groups</h3><p className="summary-count">{groupCount}</p></div>
        <div className="summary-card"><h3>Total Students</h3><p className="summary-count">{studentCount}</p></div>
        <div className="summary-card"><h3>Total Submissions</h3><p className="summary-count">{submissionCount}</p></div>
        <div className="summary-card"><h3>Graded</h3><p className="summary-count">{gradedCount}</p></div>
      </div>

      <div className="charts-container">
        <div className="chart-wrapper">
          <h3>Submissions Status</h3>
          <Doughnut data={doughnutData} />
        </div>
        <div className="chart-wrapper">
          <h3>Students per Group</h3>
          <Bar data={barChartData} />
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboardPage;