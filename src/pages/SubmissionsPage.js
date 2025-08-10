import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Dashboard.css';

function SubmissionsPage() {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);

  // گریڈنگ کے لیے نئی اسٹیٹس
  const [gradingId, setGradingId] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');

  async function fetchSubmissions() {
    const { data, error } = await supabase
      .from('submissions')
      .select(`
        id, created_at, submission_content, grade, feedback,
        profiles ( full_name ),
        assignments ( name )
      `);
    
    if (error) {
      console.error('Error fetching submissions:', error);
    } else {
      setSubmissions(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleGradeSubmission = async (submissionId) => {
    const { data, error } = await supabase
      .from('submissions')
      .update({ grade: grade, feedback: feedback })
      .eq('id', submissionId)
      .select()
      .single();

    if (error) {
      alert("Error saving grade: " + error.message);
    } else {
      // UI کو اپڈیٹ کریں
      setSubmissions(submissions.map(s => s.id === submissionId ? data : s));
      setGradingId(null); // فارم بند کر دیں
      setGrade('');
      setFeedback('');
    }
  };

  const startGrading = (submission) => {
    setGradingId(submission.id);
    setGrade(submission.grade || '');
    setFeedback(submission.feedback || '');
  };

  if (loading) {
    return <div>Loading submissions...</div>;
  }

  return (
    <div className="dashboard-container">
      <h2>Submissions</h2>
      <div className="list-container">
        <h3>All Submitted Assignments</h3>
        {submissions.length === 0 ? (
          <p>No assignments have been submitted yet.</p>
        ) : (
          <table className="students-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Assignment Name</th>
                <th>Submission</th>
                <th>Grade</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(submission => (
                <tr key={submission.id}>
                  <td>{submission.profiles ? submission.profiles.full_name : 'N/A'}</td>
                  <td>{submission.assignments ? submission.assignments.name : 'N/A'}</td>
                  <td>{submission.submission_content}</td>
                  <td>
                    {gradingId === submission.id ? (
                      // گریڈنگ فارم
                      <div className="grading-form">
                        <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="e.g., A+" />
                        <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Feedback..." />
                      </div>
                    ) : (
                      submission.grade || 'Not Graded'
                    )}
                  </td>
                  <td>
                    {gradingId === submission.id ? (
                      <div>
                        <button onClick={() => handleGradeSubmission(submission.id)} className="submit-btn">Save</button>
                        <button onClick={() => setGradingId(null)} className="cancel-btn">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => startGrading(submission)} className="auth-button">View & Grade</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default SubmissionsPage;