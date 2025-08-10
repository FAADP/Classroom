import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Dashboard.css';

function StudentDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [assignmentCount, setAssignmentCount] = useState(0);
  const [submissionCount, setSubmissionCount] = useState(0);

  useEffect(() => {
    async function fetchSummaryData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // طالب علم کی پروفائل حاصل کریں تاکہ گروپ ID مل سکے
        const { data: profileData } = await supabase.from('profiles').select('group_id').eq('id', user.id).single();

        if (profileData && profileData.group_id) {
          // کل اسائنمنٹس کی تعداد
          const { count: assignments } = await supabase.from('assignments').select('*', { count: 'exact', head: true }).eq('group_id', profileData.group_id);
          setAssignmentCount(assignments || 0);
        }

        // جمع شدہ اسائنمنٹس کی تعداد
        const { count: submissions } = await supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('student_id', user.id);
        setSubmissionCount(submissions || 0);
      }
      setLoading(false);
    }
    fetchSummaryData();
  }, []);

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
    </div>
  );
}

export default StudentDashboardPage;