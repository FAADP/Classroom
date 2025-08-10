import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Dashboard.css';

function AssignmentsPage() {
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [user, setUser] = useState(null);

  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [file, setFile] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [message, setMessage] = useState('');
  const [reusedFileUrl, setReusedFileUrl] = useState('');

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      const { data: groupsData } = await supabase.from('groups').select('id, name').eq('teacher_id', user.id);
      setGroups(groupsData || []);
      const { data: assignmentsData } = await supabase.from('assignments').select(`*, groups (name)`).eq('teacher_id', user.id).order('created_at', { ascending: false });
      setAssignments(assignmentsData || []);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      const { error } = await supabase.from('assignments').delete().eq('id', assignmentId);
      if (error) {
        alert("Error deleting assignment: " + error.message);
      } else {
        setAssignments(assignments.filter(a => a.id !== assignmentId));
      }
    }
  };

  const handleReuseAssignment = (assignment) => {
    setName(assignment.name);
    setDetails(assignment.details);
    setSelectedGroup(assignment.group_id);
    setReusedFileUrl(assignment.link_url || '');
    setFile(null);
    document.getElementById('assignmentFile').value = "";
    setMessage('Reusing assignment details. You can edit and create a new one.');
    setTimeout(() => setMessage(''), 5000);
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    if (!selectedGroup) {
      setMessage('Please select a group.');
      setLoading(false);
      return;
    }
    let fileUrl = reusedFileUrl;
    if (file) {
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
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
      .insert({ name, details, link_url: fileUrl, group_id: selectedGroup, teacher_id: user.id })
      .select(`*, groups (name)`)
      .single();
    if (error) {
      setMessage('Error creating assignment: ' + error.message);
    } else {
      setMessage('Assignment created successfully!');
      setAssignments([newAssignment, ...assignments]);
      setName('');
      setDetails('');
      setFile(null);
      setReusedFileUrl('');
      document.getElementById('assignmentFile').value = "";
      setSelectedGroup('');
      setTimeout(() => setMessage(''), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="dashboard-container">
      <h2>Assignments</h2>
      <div className="form-container">
        <h3>Create a New Assignment</h3>
        <form className="add-student-form" onSubmit={handleCreateAssignment}>
          <input type="text" placeholder="Assignment Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <textarea placeholder="Details about the assignment" value={details} onChange={(e) => setDetails(e.target.value)} />
          <label htmlFor="assignmentFile">Upload File (Optional)</label>
          <input id="assignmentFile" type="file" onChange={(e) => setFile(e.target.files[0])} />
          {reusedFileUrl && <p>Reusing existing file. Upload a new one to override.</p>}
          <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} required>
            <option value="">Select a Group</option>
            {groups.map(group => (<option key={group.id} value={group.id}>{group.name}</option>))}
          </select>
          <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Assignment'}</button>
        </form>
        {message && <p className="success-message">{message}</p>}
      </div>
      <div className="list-container">
        <h3>Created Assignments</h3>
        {assignments.length === 0 ? (<p>No assignments created yet.</p>) : (
          <table className="students-table">
            <thead><tr><th>Assignment Name</th><th>Assigned to Group</th><th>File</th><th>Actions</th></tr></thead>
            <tbody>
              {assignments.map(assignment => (
                <tr key={assignment.id}>
                  <td>{assignment.name}</td>
                  <td>{assignment.groups ? assignment.groups.name : 'N/A'}</td>
                  <td>
                    {assignment.link_url ? (
                      <a href={assignment.link_url} target="_blank" rel="noopener noreferrer">View File</a>
                    ) : ( 'No file' )}
                  </td>
                  <td>
                    <button onClick={() => handleReuseAssignment(assignment)} className="reuse-btn" style={{ backgroundColor: 'yellow' }}>Reuse</button>
                    <button onClick={() => handleDeleteAssignment(assignment.id)} className="delete-btn">Delete</button>
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

export default AssignmentsPage;