import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Dashboard.css';
// چارٹ لائبریری سے ضروری چیزیں امپورٹ کریں
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Doughnut } from 'react-chartjs-2';

// نئے پلگ ان کو رجسٹر کریں
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

function StudentDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [assignmentCount, setAssignmentCount] = useState(0);
  const [submissionCount, setSubmissionCount] = useState(0);

  useEffect(() => {
    async function fetchSummaryData() { // فنکشن کا نام یہ ہے
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profileData } = await supabase.from('profiles').select('group_id').eq('id', user.id).single();

        if (profileData && profileData.group_id) {
          const { count: assignments } = await supabase.from('assigned_tasks').select('*', { count: 'exact', head: true }).eq('group_id', profileData.group_id);
          setAssignmentCount(assignments || 0);
        }

        const { count: submissions } = await supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('student_id', user.id);
        setSubmissionCount(submissions || 0);
      }
      setLoading(false);
    }
    fetchSummaryData(); // یہاں نام درست کر دیا گیا ہے
  }, []);

  const doughnutData = {
    labels: ['Submitted', 'Pending'],
    datasets: [
      {
        label: 'Assignments',
        data: [submissionCount, assignmentCount - submissionCount],
        backgroundColor: ['#28a745', '#dc3545'],
        borderColor: ['#ffffff', '#ffffff'],
        borderWidth: 2,
      },
    ],
  };
  
  const doughnutOptions = {
    plugins: {
      datalabels: {
        color: 'white',
        font: {
          weight: 'bold',
          size: 16,
        },
      },
      legend: {
          labels: {
              color: '#333'
          }
      }
    },
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <h2>Student Dashboard</h2>
      <p>Welcome! Here is a summary of your activities.</p>
      
      <div className="summary-cards-container">
        <div className="summary-card">
          <h3>Total Assignments</h3>
          <p className="summary-count">{assignmentCount}</p>
        </div>
        <div className="summary-card">
          <h3>Assignments Submitted</h3>
          <p className="summary-count">{submissionCount}</p>
        </div>
      </div>

      <div className="charts-container" style={{gridTemplateColumns: '1fr', maxWidth: '400px', margin: '30px auto'}}>
        <div className="chart-wrapper">
          <h3>Your Progress</h3>
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>
    </div>
  );
}

export default StudentDashboardPage;