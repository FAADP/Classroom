import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Dashboard.css';

function AssignmentsPage() {
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [user, setUser] = useState(null);

  // فارم کے لیے اسٹیٹس
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [message, setMessage] = useState('');

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      // گروپس حاصل کریں
      const { data: groupsData } = await supabase.from('groups').select('id, name').eq('teacher_id', user.id);
      setGroups(groupsData || []);

      // اسائنمنٹس حاصل کریں
      const { data: assignmentsData } = await supabase.from('assignments').select(`*, groups (name)`).eq('teacher_id', user.id);
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

    if (!selectedGroup) {
      setMessage('Please select a group to assign this to.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('assignments')
      .insert({
        name,
        details,
        link_url: linkUrl,
        group_id: selectedGroup,
        teacher_id: user.id
      })
      .select(`*, groups (name)`)
      .single();

    if (error) {
      setMessage('Error creating assignment: ' + error.message);
    } else {
      setMessage('Assignment created successfully!');
      setAssignments([data, ...assignments]);
      // فارم ری سیٹ کریں
      setName('');
      setDetails('');
      setLinkUrl('');
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
          <input type="url" placeholder="https://example.com (optional link)" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
          <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} required>
            <option value="">Select a Group</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Assignment'}
          </button>
        </form>
        {message && <p className="success-message">{message}</p>}
      </div>

      <div className="list-container">
        <h3>Created Assignments</h3>
        {assignments.length === 0 ? (
          <p>No assignments created yet.</p>
        ) : (
          <table className="students-table">
            <thead>
              <tr>
                <th>Assignment Name</th>
                <th>Assigned to Group</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(assignment => (
                <tr key={assignment.id}>
                  <td>{assignment.name}</td>
                  <td>{assignment.groups ? assignment.groups.name : 'N/A'}</td>
                  <td>
                    <button className="delete-btn">Delete</button>
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