import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Dashboard.css';

function StudentAssignmentsPage() {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [user, setUser] = useState(null);
  const [submittedIds, setSubmittedIds] = useState(new Set());

  const [submittingId, setSubmittingId] = useState(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchStudentData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('group_id')
          .eq('id', user.id)
          .single();

        if (profileData && profileData.group_id) {
          const { data: assignmentsData } = await supabase
            .from('assignments')
            .select('*')
            .eq('group_id', profileData.group_id);
          
          setAssignments(assignmentsData || []);

          const { data: submissionsData } = await supabase
            .from('submissions')
            .select('assignment_id')
            .eq('student_id', user.id);
          
          if (submissionsData) {
            const ids = new Set(submissionsData.map(s => s.assignment_id));
            setSubmittedIds(ids);
          }
        }
      }
      setLoading(false);
    }
    fetchStudentData();
  }, []);

  const handleSubmission = async (assignmentId) => {
    if (!submissionContent.trim()) {
      alert("Please enter your submission content.");
      return;
    }

    const { error } = await supabase
      .from('submissions')
      .insert({
        assignment_id: assignmentId,
        student_id: user.id,
        submission_content: submissionContent
      });

    if (error) {
      setMessage('Error submitting assignment: ' + error.message);
    } else {
      setMessage('Assignment submitted successfully!');
      setSubmittedIds(new Set([...submittedIds, assignmentId]));
      setSubmittingId(null);
      setSubmissionContent('');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return <div>Loading assignments...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="list-container">
        <h3>My Assignments</h3>
        <div className="content">
            {message && <p className="success-message">{message}</p>}
            {assignments.length === 0 ? (
              <p>You have no new assignments.</p>
            ) : (
              assignments.map(assignment => (
                <div key={assignment.id} className="assignment-card">
                  <h4>{assignment.name}</h4>
                  <p>{assignment.details}</p>
                  {assignment.link_url && (
                    <a href={assignment.link_url} target="_blank" rel="noopener noreferrer">
                      View Resource
                    </a>
                  )}
                  <div className="submission-section">
                    {submittedIds.has(assignment.id) ? (
                      <p className="submitted-message">✔️ Submitted</p>
                    ) : submittingId === assignment.id ? (
                      <div>
                        <textarea 
                          placeholder="Enter your submission link or text here..."
                          value={submissionContent}
                          onChange={(e) => setSubmissionContent(e.target.value)}
                        />
                        <button onClick={() => handleSubmission(assignment.id)} className="submit-btn">
                          Confirm Submission
                        </button>
                        <button onClick={() => setSubmittingId(null)} className="cancel-btn">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setSubmittingId(assignment.id)} className="auth-button">
                        Submit Work
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
        </div>
      </div>
    </div>
  );
}

export default StudentAssignmentsPage;