import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Dashboard.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [studentsInGroup, setStudentsInGroup] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');

  const [includeAttendance, setIncludeAttendance] = useState(true);
  const [includeSubmissions, setIncludeSubmissions] = useState(true);
  
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    async function fetchGroups() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('groups').select('id, name').eq('teacher_id', user.id);
        setGroups(data || []);
      }
    }
    fetchGroups();
  }, []);

  const handleGroupChange = async (groupId) => {
    setSelectedGroup(groupId);
    setSelectedStudent('');
    setReportData(null);
    if (!groupId) {
      setStudentsInGroup([]);
      return;
    }
    const { data } = await supabase.from('profiles').select('id, full_name, email').eq('group_id', groupId);
    setStudentsInGroup(data || []);
  };
  
  const handleGenerateReport = async () => {
    if (!selectedStudent) {
      alert('Please select an option.');
      return;
    }
    setLoading(true);
    setReportData(null);

    let studentsToFetch = [];
    if (selectedStudent === 'all') {
      studentsToFetch = studentsInGroup;
    } else {
      studentsToFetch = studentsInGroup.filter(s => s.id === selectedStudent);
    }

    const finalReport = [];
    for (const student of studentsToFetch) {
      const { data: attendance } = await supabase.from('attendance').select('attendance_date, status').eq('student_id', student.id);
      const { data: submissions } = await supabase.from('submissions').select('grade, feedback, assignments ( name )').eq('student_id', student.id);
      
      finalReport.push({
        profile: student,
        attendance: attendance || [],
        submissions: submissions || []
      });
    }
    
    setReportData(finalReport);
    setLoading(false);
  };

  // --- PDF بنانے کا نیا اور بہتر فنکشن ---
  const handleDownloadPdf = () => {
    if (!reportData || reportData.length === 0) {
      alert('No report data available to generate PDF.');
      return;
    }
    const doc = new jsPDF();

    reportData.forEach((report, index) => {
      if (index > 0) doc.addPage();
      const studentProfile = report.profile;

      doc.setFontSize(18);
      doc.text("Student Performance Report", 14, 22);
      doc.setFontSize(12);
      doc.text(`Student: ${studentProfile.full_name} (${studentProfile.email || ''})`, 14, 32);

      let startY = 40;

      if (includeAttendance && report.attendance && report.attendance.length > 0) {
        autoTable(doc, {
          startY: startY,
          head: [['Date', 'Status']],
          body: report.attendance.map(att => [new Date(att.attendance_date).toLocaleDateString(), att.status || 'N/A']),
        });
        startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : startY + 10; // Safely update startY
      }

      if (includeSubmissions && report.submissions && report.submissions.length > 0) {
        autoTable(doc, {
          startY: startY,
          head: [['Assignment', 'Grade', 'Feedback']],
          body: report.submissions.map(sub => [sub.assignments?.name || 'N/A', sub.grade || 'Not Graded', sub.feedback || '-']),
        });
      }
    });
    doc.save("student_reports.pdf");
  };

  return (
    <div className="dashboard-container">
      <h2>Generate Reports</h2>
      
      <div className="form-container">
        <h3>Report Options</h3>
        <div className="add-student-form">
          <label>1. Select Group</label>
          <select value={selectedGroup} onChange={(e) => handleGroupChange(e.target.value)}>
            <option value="">-- Select a Group --</option>
            {groups.map(group => (<option key={group.id} value={group.id}>{group.name}</option>))}
          </select>

          {selectedGroup && (
            <>
              <label>2. Select Student(s)</label>
              <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
                <option value="">-- Select an Option --</option>
                <option value="all">All Students in this Group</option>
                <hr />
                {studentsInGroup.map(student => (<option key={student.id} value={student.id}>{student.full_name} ({student.email})</option>))}
              </select>
            </>
          )}

          {selectedStudent && <>
            <label>3. Include in Report</label>
            <div className="checkbox-group">
              <label><input type="checkbox" checked={includeAttendance} onChange={() => setIncludeAttendance(!includeAttendance)} /> Attendance Record</label>
              <label><input type="checkbox" checked={includeSubmissions} onChange={() => setIncludeSubmissions(!includeSubmissions)} /> Submissions & Grades</label>
            </div>
            <button onClick={handleGenerateReport} disabled={loading || !selectedStudent} className="auth-button">
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </>}
        </div>
      </div>
      
      {reportData && (
        <div className="list-container">
          <h3>Generated Report(s)</h3>
          <div className="content">
            <button onClick={handleDownloadPdf} className="auth-button" style={{marginBottom: '20px', backgroundColor: '#17a2b8'}} disabled={!reportData}>
              Download as PDF
            </button>
            {reportData.map((report, index) => (
              <div key={index} className="report-wrapper" style={{border: '1px solid #ddd', padding: '15px', marginBottom: '15px'}}>
                <div className="report-section"><h4>{report.profile.full_name} ({report.profile.email})</h4></div>
                {includeAttendance && <div className="report-section"><h5>Attendance</h5>{report.attendance.length > 0 ? <ul>{report.attendance.map((att, i) => <li key={i}>{new Date(att.attendance_date).toLocaleDateString()}: {att.status}</li>)}</ul> : <p>No records found.</p>}</div>}
                {includeSubmissions && <div className="report-section"><h5>Submissions</h5>{report.submissions.length > 0 ? <ul>{report.submissions.map((sub, i) => <li key={i}>{sub.assignments?.name}: {sub.grade || 'Not Graded'}</li>)}</ul> : <p>No records found.</p>}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportsPage;