import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Dashboard.css';

function SubmissionsPage() {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [gradingId, setGradingId] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    async function fetchSubmissions() {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          id, created_at, submission_text, submission_file_url, grade, feedback, 
          profiles ( full_name ), 
          assignments ( name )
        `);
      
      if (error) {
        console.error('Error fetching submissions:', error);
      } else {
        setSubmissions(data || []);
      }
      setLoading(false);
    }
    fetchSubmissions();
  }, []);

  const handleGradeSubmission = async (submissionId) => {
    const { data, error } = await supabase
      .from('submissions')
      .update({ grade, feedback })
      .eq('id', submissionId)
      .select(`*, profiles(full_name), assignments(name)`)
      .single();

    if (error) {
      alert("Error saving grade: " + error.message);
    } else {
      setSubmissions(submissions.map(s => s.id === submissionId ? data : s));
      setGradingId(null);
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
      <div className="list-container">
        <h3>All Submitted Assignments</h3>
        <div className="content">
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
                  <td>
                    {submission.submission_text && <p>{submission.submission_text}</p>}
                    {/* --- یہاں تبدیلی کی گئی ہے --- */}
                    {/* اب یہ براہ راست پبلک لنک استعمال کر رہا ہے */}
                    {submission.submission_file_url && (
                      <a href={submission.submission_file_url} target="_blank" rel="noopener noreferrer">
                        View Submitted File
                      </a>
                    )}
                  </td>
                  <td>
                    {gradingId === submission.id ? (
                      <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="e.g., A+" />
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
                      <button onClick={() => startGrading(submission)} className="auth-button">Grade</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SubmissionsPage;