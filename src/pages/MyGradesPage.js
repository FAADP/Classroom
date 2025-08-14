import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Dashboard.css';

function MyGradesPage() {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    async function fetchGrades() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('submissions')
          .select(`id, submission_text, submission_file_url, grade, feedback, assignments ( name )`)
          .eq('student_id', user.id);
        setSubmissions(data || []);
      }
      setLoading(false);
    }
    fetchGrades();
  }, []);

  if (loading) {
    return <div>Loading your grades...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="list-container">
        <h3>My Grades & Submissions</h3>
        <div className="content">
          <table className="students-table">
            <thead><tr><th>Assignment</th><th>Your Submission</th><th>Grade</th><th>Feedback</th></tr></thead>
            <tbody>
              {submissions.map(submission => (
                <tr key={submission.id}>
                  <td>{submission.assignments ? submission.assignments.name : 'Deleted'}</td>
                  <td>
                    {submission.submission_text && <p>{submission.submission_text}</p>}
                    {submission.submission_file_url && (
                      <a href={submission.submission_file_url} target="_blank" rel="noopener noreferrer">
                        View Submitted File
                      </a>
                    )}
                  </td>
                  <td>{submission.grade || 'Not Graded'}</td>
                  <td>{submission.feedback || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MyGradesPage;