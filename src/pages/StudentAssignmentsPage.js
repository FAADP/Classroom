import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Dashboard.css';

function StudentAssignmentsPage() {
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [user, setUser] = useState(null);
  const [submittedIds, setSubmittedIds] = useState(new Set());

  const [submittingId, setSubmittingId] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchStudentData() {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if(user){
            const { data: profileData } = await supabase.from('profiles').select('group_id').eq('id', user.id).single();
            if (profileData && profileData.group_id) {
                const { data: assignedTasks } = await supabase.from('assigned_tasks').select(`assignments ( id, name, details, link_url )`).eq('group_id', profileData.group_id);
                if(assignedTasks){
                    const studentAssignments = assignedTasks.map(task => task.assignments);
                    setAssignments(studentAssignments);
                }
            }
            const { data: submissionsData } = await supabase.from('submissions').select('assignment_id').eq('student_id', user.id);
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
    if (!submissionFile && !submissionText.trim()) {
      alert("Please either upload a file or write something.");
      return;
    }
    setLoading(true);
    let publicURL = null;

    if (submissionFile) {
      const fileExt = submissionFile.name.split('.').pop();
      const safeFileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${safeFileName}`;

      const { error: uploadError } = await supabase.storage.from('submissions').upload(filePath, submissionFile);
      if (uploadError) {
        setMessage('Error uploading file: ' + uploadError.message);
        setLoading(false);
        return;
      }
      
      // --- کلیدی تبدیلی یہاں ہے ---
      // اب ہم مکمل پبلک URL حاصل کر رہے ہیں
      const { data } = supabase.storage.from('submissions').getPublicUrl(filePath);
      publicURL = data.publicUrl;
    }

    const { error } = await supabase.from('submissions').insert({
        assignment_id: assignmentId,
        student_id: user.id,
        submission_text: submissionText,
        submission_file_url: publicURL // اب ہم مکمل لنک محفوظ کر رہے ہیں
      });

    if (error) {
      setMessage('Error submitting assignment: ' + error.message);
    } else {
      setMessage('Assignment submitted successfully!');
      setSubmittedIds(new Set([...submittedIds, assignmentId]));
      setSubmittingId(null);
      setSubmissionFile(null);
      setSubmissionText('');
      setTimeout(() => setMessage(''), 3000);
    }
    setLoading(false);
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
            {assignments.map(assignment => (
              <div key={assignment.id} className="assignment-card">
                <h4>{assignment.name}</h4>
                <p>{assignment.details}</p>
                {assignment.link_url && ( <a href={assignment.link_url} target="_blank" rel="noopener noreferrer">View Resource</a> )}
                <div className="submission-section">
                  {submittedIds.has(assignment.id) ? (
                    <p className="submitted-message">✔️ Submitted</p>
                  ) : submittingId === assignment.id ? (
                    <div>
                      <textarea placeholder="Enter your submission text here..." value={submissionText} onChange={(e) => setSubmissionText(e.target.value)} />
                      <label htmlFor="submissionFile">Or upload a file</label>
                      <input id="submissionFile" type="file" onChange={(e) => setSubmissionFile(e.target.files[0])} />
                      <button onClick={() => handleSubmission(assignment.id)} className="submit-btn" disabled={loading}>
                        {loading ? 'Submitting...' : 'Confirm Submission'}
                      </button>
                      <button onClick={() => setSubmittingId(null)} className="cancel-btn">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setSubmittingId(assignment.id)} className="auth-button">Submit Work</button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default StudentAssignmentsPage;