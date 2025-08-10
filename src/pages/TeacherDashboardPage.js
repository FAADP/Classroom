import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Dashboard.css';

function TeacherDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [groupCount, setGroupCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [gradedCount, setGradedCount] = useState(0);

  useEffect(() => {
    async function fetchSummaryData() {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // گروپس کی تعداد
        const { count: groups } = await supabase.from('groups').select('*', { count: 'exact', head: true }).eq('teacher_id', user.id);
        setGroupCount(groups || 0);

        // اسٹوڈنٹس کی تعداد
        const { count: students } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
        setStudentCount(students || 0);
        
        // کل جمع شدہ اسائنمنٹس کی تعداد
        const { count: submissions } = await supabase.from('submissions').select('*', { count: 'exact', head: true });
        setSubmissionCount(submissions || 0);

        // چیک شدہ اسائنمنٹس کی تعداد
        const { count: graded } = await supabase.from('submissions').select('*', { count: 'exact', head: true }).not('grade', 'is', null);
        setGradedCount(graded || 0);
      }
      setLoading(false);
    }
    fetchSummaryData();
  }, []);

  if (loading) {
    return <div>Loading dashboard summary...</div>;
  }

  return (
    <div className="dashboard-container">
      <h2>Teacher Dashboard</h2>
      
      <div className="summary-cards-container">
        <div className="summary-card">
          <h3>Total Groups</h3>
          <p className="summary-count">{groupCount}</p>
        </div>
        <div className="summary-card">
          <h3>Total Students</h3>
          <p className="summary-count">{studentCount}</p>
        </div>
        <div className="summary-card">
          <h3>Total Submissions</h3>
          <p className="summary-count">{submissionCount}</p>
        </div>
        <div className="summary-card">
          <h3>Graded Submissions</h3>
          <p className="summary-count">{gradedCount}</p>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboardPage;