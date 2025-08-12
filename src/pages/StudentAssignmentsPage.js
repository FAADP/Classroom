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
        // --- کلیدی تبدیلی یہاں ہے ---
        // 1. طالب علم کی پروفائل سے اس کا گروپ ID حاصل کریں
        const { data: profileData } = await supabase
          .from('profiles')
          .select('group_id')
          .eq('id', user.id)
          .single();

        if (profileData && profileData.group_id) {
          // 2. 'assigned_tasks' ٹیبل سے وہ تمام اسائنمنٹس حاصل کریں جو اس گروپ کو بھیجی گئی ہیں
          const { data: assignedTasks, error } = await supabase
            .from('assigned_tasks')
            .select(`
              assignments (
                id, name, details, link_url
              )
            `)
            .eq('group_id', profileData.group_id);

          if (error) {
            console.error('Error fetching assigned tasks:', error);
          } else {
            // 3. اسائنمنٹس کی لسٹ کو صاف کریں
            const studentAssignments = assignedTasks.map(task => task.assignments);
            setAssignments(studentAssignments);
          }
        }
        
        // 4. طالب علم کی جمع شدہ اسائنمنٹس حاصل کریں (یہ پہلے جیسا ہی ہے)
        const { data: submissionsData } = await supabase
            .from('submissions')
            .select('assignment_id')
            .eq('student_id', user.id);
          
        if (submissionsData) {
            const ids = new Set(submissionsData.map(s => s.assignment_id));
            setSubmittedIds(ids);
        }
      }
      setLoading(false);
    }
    fetchStudentData();
  }, []);

  const handleSubmission = async (assignmentId) => {
    // ... یہ فنکشن پہلے جیسا ہی رہے گا ...
    if (!submissionContent.trim()) {
      alert("Please enter submission.");
      return;
    }
    const { error } = await supabase.from('submissions').insert({ assignment_id: assignmentId, student_id: user.id, submission_content: submissionContent });
    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('Submitted successfully!');
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
                  {assignment.link_url && ( <a href={assignment.link_url} target="_blank" rel="noopener noreferrer">View Resource</a> )}
                  <div className="submission-section">
                    {submittedIds.has(assignment.id) ? (
                      <p className="submitted-message">✔️ Submitted</p>
                    ) : submittingId === assignment.id ? (
                      <div>
                        <textarea placeholder="Enter submission..." value={submissionContent} onChange={(e) => setSubmissionContent(e.target.value)} />
                        <button onClick={() => handleSubmission(assignment.id)} className="submit-btn">Confirm</button>
                        <button onClick={() => setSubmittingId(null)} className="cancel-btn">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setSubmittingId(assignment.id)} className="auth-button">Submit Work</button>
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