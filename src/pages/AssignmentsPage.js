import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Dashboard.css';

function AssignmentsPage() {
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]); // यह हमारा اسائنمنٹ بینک ہے
  const [groups, setGroups] = useState([]);
  const [user, setUser] = useState(null);

  // فارم کے لیے اسٹیٹس
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [file, setFile] = useState(null);
  
  // اسائنمنٹ بھیجنے کے لیے اسٹیٹس
  const [assigningId, setAssigningId] = useState(null); // کس اسائنمنٹ کو بھیج رہے ہیں
  const [groupToAssign, setGroupToAssign] = useState('');

  const [message, setMessage] = useState('');

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data: groupsData } = await supabase.from('groups').select('id, name').eq('teacher_id', user.id);
      setGroups(groupsData || []);
      
      // اب ہم صرف اسائنمنٹ بینک لائیں گے
      const { data: assignmentsData } = await supabase.from('assignments').select('*').eq('teacher_id', user.id).order('created_at', { ascending: false });
      setAssignments(assignmentsData || []);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    let fileUrl = '';
    if (file) {
      const fileExt = file.name.split('.').pop();
      const safeFileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${safeFileName}`;
      const { error: uploadError } = await supabase.storage.from('assignments').upload(filePath, file);
      if (uploadError) {
        setMessage('Error uploading file: ' + uploadError.message);
        setLoading(false);
        return;
      }
      const { data } = supabase.storage.from('assignments').getPublicUrl(filePath);
      fileUrl = data.publicUrl;
    }

    const { data: newAssignment, error } = await supabase
      .from('assignments')
      .insert({ name, details, link_url: fileUrl, teacher_id: user.id })
      .select()
      .single();

    if (error) {
      setMessage('Error creating assignment: ' + error.message);
    } else {
      setMessage('New assignment added to your bank!');
      setAssignments([newAssignment, ...assignments]);
      setName(''); setDetails(''); setFile(null);
      document.getElementById('assignmentFile').value = "";
      setTimeout(() => setMessage(''), 3000);
    }
    setLoading(false);
  };
  
  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm("Are you sure? This will only delete from the bank.")) {
      const { error } = await supabase.from('assignments').delete().eq('id', assignmentId);
      if (error) alert(error.message);
      else setAssignments(assignments.filter(a => a.id !== assignmentId));
    }
  };

  // اسائنمنٹ بھیجنے کا نیا فنکشن
  const handleAssignTask = async (assignmentId) => {
    if (!groupToAssign) {
        alert("Please select a group to assign this task.");
        return;
    }
    const { error } = await supabase
      .from('assigned_tasks')
      .insert({
        assignment_id: assignmentId,
        group_id: groupToAssign,
        teacher_id: user.id
      });
    
    if (error) {
        alert("Error assigning task: " + error.message);
    } else {
        alert("Task assigned successfully to the selected group!");
        setAssigningId(null);
        setGroupToAssign('');
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Assignment Bank</h2>
      
      <div className="form-container">
        <h3>Create a New Assignment</h3>
        <form className="add-student-form" onSubmit={handleCreateAssignment}>
          <input type="text" placeholder="Assignment Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <textarea placeholder="Details" value={details} onChange={(e) => setDetails(e.target.value)} />
          <label htmlFor="assignmentFile">Upload File (Optional)</label>
          <input id="assignmentFile" type="file" onChange={(e) => setFile(e.target.files[0])} />
          <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save to Bank'}</button>
        </form>
        {message && <p className="success-message">{message}</p>}
      </div>

      <div className="list-container">
        <h3>Your Saved Assignments</h3>
        <table className="students-table">
          <thead><tr><th>Name</th><th>File</th><th>Actions</th></tr></thead>
          <tbody>
            {assignments.map(assignment => (
              <tr key={assignment.id}>
                <td>
                  {assignment.name}
                  {/* اسائنمنٹ بھیجنے کا فارم */}
                  {assigningId === assignment.id && (
                    <div className="assign-form">
                      <select value={groupToAssign} onChange={(e) => setGroupToAssign(e.target.value)}>
                        <option value="">Select a group</option>
                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                      <button onClick={() => handleAssignTask(assignment.id)} className="submit-btn">Confirm</button>
                      <button onClick={() => setAssigningId(null)} className="cancel-btn">Cancel</button>
                    </div>
                  )}
                </td>
                <td>{assignment.link_url ? (<a href={assignment.link_url} target="_blank" rel="noopener noreferrer">View File</a>) : ('No file')}</td>
                <td style={{display: 'flex', gap: '5px'}}>
                  <button onClick={() => setAssigningId(assignment.id)} className="auth-button" style={{backgroundColor: '#17a2b8'}}>Assign</button>
                  <button onClick={() => handleDeleteAssignment(assignment.id)} className="delete-btn">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AssignmentsPage;