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
        const { data, error } = await supabase
          .from('submissions')
          .select(`
            id,
            submission_content,
            grade,
            feedback,
            assignments ( name )
          `)
          .eq('student_id', user.id);
        
        if (error) {
          console.error('Error fetching grades:', error);
        } else {
          setSubmissions(data);
        }
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
          {submissions.length === 0 ? (
            <p>You have not submitted any assignments yet.</p>
          ) : (
            <table className="students-table">
              <thead>
                <tr>
                  <th>Assignment Name</th>
                  <th>Your Submission</th>
                  <th>Grade</th>
                  <th>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(submission => (
                  <tr key={submission.id}>
                    <td>{submission.assignments ? submission.assignments.name : 'N/A'}</td>
                    <td>{submission.submission_content}</td>
                    <td>{submission.grade || 'Not Graded Yet'}</td>
                    <td>{submission.feedback || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyGradesPage;