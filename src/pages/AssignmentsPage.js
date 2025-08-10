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
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [message, setMessage] = useState('');

  // ... fetchData فنکشن پہلے جیسا ہی رہے گا ...
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
    // ... handleDeleteAssignment فنکشن پہلے جیسا ہی رہے گا ...
    if (window.confirm("Are you sure?")) {
      const { error } = await supabase.from('assignments').delete().eq('id', assignmentId);
      if (error) alert(error.message);
      else setAssignments(assignments.filter(a => a.id !== assignmentId));
    }
  };

  const handleCreateAssignment = async (e) => {
    // ... handleCreateAssignment فنکشن پہلے جیسا ہی رہے گا, صرف link_url استعمال کریں ...
    e.preventDefault();
    setLoading(true);
    setMessage('');
    if (!selectedGroup) { setMessage('Please select a group.'); setLoading(false); return; }
    const { data: newAssignment, error } = await supabase.from('assignments').insert({ name, details, link_url: linkUrl, group_id: selectedGroup, teacher_id: user.id }).select(`*, groups (name)`).single();
    if (error) { setMessage('Error: ' + error.message); } 
    else {
      setMessage('Assignment created successfully!');
      setAssignments([newAssignment, ...assignments]);
      setName(''); setDetails(''); setLinkUrl(''); setSelectedGroup('');
      setTimeout(() => setMessage(''), 3000);
    }
    setLoading(false);
  };
  
  // نیا فنکشن: اسائنمنٹ کو دوبارہ استعمال کرنے کے لیے فارم بھرنا
  const handleReuseAssignment = (assignment) => {
    setName(assignment.name);
    setDetails(assignment.details || '');
    setLinkUrl(assignment.link_url || '');
    // گروپ کو خالی چھوڑ دیں تاکہ ٹیچر نیا گروپ منتخب کرے
    setSelectedGroup('');
    window.scrollTo(0, 0); // صفحے کے اوپر سکرول کریں
  };

  return (
    <div className="dashboard-container">
      <h2>Assignments</h2>
      <div className="form-container">
        <h3>Create a New Assignment</h3>
        <form className="add-student-form" onSubmit={handleCreateAssignment}>
          <input type="text" placeholder="Assignment Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <textarea placeholder="Details about the assignment" value={details} onChange={(e) => setDetails(e.target.value)} />
          <input type="url" placeholder="https://example.com (optional link)" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
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
        <table className="students-table">
          <thead><tr><th>Name</th><th>Group</th><th>Resource</th><th>Actions</th></tr></thead>
          <tbody>
            {assignments.map(assignment => (
              <tr key={assignment.id}>
                <td>{assignment.name}</td>
                <td>{assignment.groups ? assignment.groups.name : 'N/A'}</td>
                <td>
                  {assignment.link_url ? (<a href={assignment.link_url} target="_blank" rel="noopener noreferrer">View Link</a>) : ('No link')}
                </td>
                <td style={{display: 'flex', gap: '5px'}}>
                  <button onClick={() => handleReuseAssignment(assignment)} className="auth-button" style={{backgroundColor: '#ffc107'}}>Reuse</button>
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