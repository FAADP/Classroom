import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Dashboard.css';

function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    async function fetchStudents() {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'student');
      
      if (error) console.error('Error fetching students:', error);
      else setStudents(data || []);
    }
    fetchStudents();
  }, []);

  const handleGenerateReport = async () => {
    if (!selectedStudentId) {
      alert('Please select a student.');
      return;
    }
    setLoading(true);
    setReportData(null);

    // --- یہاں تبدیلی کی گئی ہے ---

    // 1. صرف پروفائل حاصل کریں (بغیر گروپ کے)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, group_id')
      .eq('id', selectedStudentId)
      .single();

    if (profileError || !profile) {
      alert("Error: Could not find the student's profile.");
      setLoading(false);
      return;
    }

    // 2. اگر گروپ ID ہے تو گروپ کا نام علیحدہ حاصل کریں
    let groupName = 'Not Assigned';
    if (profile.group_id) {
      const { data: group } = await supabase
        .from('groups')
        .select('name')
        .eq('id', profile.group_id)
        .single();
      if (group) {
        groupName = group.name;
      }
    }

    // 3. طالب علم کی حاضری
    const { data: attendance } = await supabase
      .from('attendance')
      .select('attendance_date, status')
      .eq('student_id', selectedStudentId);
      
    // 4. طالب علم کے جمع کروائے گئے اسائنمنٹس
    const { data: submissions } = await supabase
      .from('submissions')
      .select('grade, feedback, assignments ( name )')
      .eq('student_id', selectedStudentId);

    setReportData({ 
      profile: { ...profile, group_name: groupName }, 
      attendance: attendance || [], 
      submissions: submissions || [] 
    });
    setLoading(false);
  };

  return (
    <div className="dashboard-container">
      <h2>Generate Reports</h2>
      
      <div className="form-container">
        <h3>Select a Student</h3>
        <div style={{display: 'flex', gap: '10px'}}>
          <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} style={{flexGrow: 1}}>
            <option value="">-- Select Student --</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>{student.full_name}</option>
            ))}
          </select>
          <button onClick={handleGenerateReport} disabled={loading} className="auth-button">
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {reportData && (
        <div className="list-container">
          <h3>Report for: {reportData.profile.full_name}</h3>
          
          <div className="report-section">
            <h4>Profile Information</h4>
            <p><strong>Name:</strong> {reportData.profile.full_name}</p>
            <p><strong>Group:</strong> {reportData.profile.group_name}</p>
          </div>

          <div className="report-section">
            <h4>Attendance Record ({reportData.attendance.length} days)</h4>
            {reportData.attendance.length > 0 ? (
              <table className="students-table">
                <thead><tr><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                  {reportData.attendance.map((record, index) => (
                    <tr key={index}>
                      <td>{new Date(record.attendance_date).toLocaleDateString()}</td>
                      <td>{record.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p>No attendance records found.</p>}
          </div>

          <div className="report-section">
            <h4>Submissions ({reportData.submissions.length} submitted)</h4>
            {reportData.submissions.length > 0 ? (
              <table className="students-table">
                <thead><tr><th>Assignment</th><th>Grade</th><th>Feedback</th></tr></thead>
                <tbody>
                  {reportData.submissions.map((sub, index) => (
                    <tr key={index}>
                      <td>{sub.assignments ? sub.assignments.name : 'N/A'}</td>
                      <td>{sub.grade || 'Not Graded'}</td>
                      <td>{sub.feedback || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p>No submissions found.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportsPage;