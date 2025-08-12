import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Dashboard.css';

function AssignmentsPage() {
  const [loading, setLoading] = useState(false);
  const [allAssignments, setAllAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all');

  // فارم کے لیے اسٹیٹس
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [file, setFile] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [message, setMessage] = useState('');

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data: groupsData } = await supabase.from('groups').select('id, name').eq('teacher_id', user.id);
      setGroups(groupsData || []);
      
      const { data: assignmentsData } = await supabase.from('assignments').select(`*, groups (name)`).eq('teacher_id', user.id).order('created_at', { ascending: false });
      setAllAssignments(assignmentsData || []);
      setFilteredAssignments(assignmentsData || []);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // فلٹر کی منطق
  useEffect(() => {
    if (filter === 'all') {
      setFilteredAssignments(allAssignments);
    } else {
      setFilteredAssignments(allAssignments.filter(a => a.group_id === parseInt(filter)));
    }
  }, [filter, allAssignments]);

  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm("Are you sure?")) {
      const { error } = await supabase.from('assignments').delete().eq('id', assignmentId);
      if (error) alert(error.message);
      else fetchData(); // ڈیٹا دوبارہ حاصل کریں
    }
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

    const { error } = await supabase.from('assignments').insert({ name, details, link_url: fileUrl, group_id: selectedGroup, teacher_id: user.id });
    if (error) {
      setMessage('Error creating assignment: ' + error.message);
    } else {
      setMessage('Assignment created successfully!');
      fetchData(); // ڈیٹا دوبارہ حاصل کریں
      setName(''); setDetails(''); setFile(null); setSelectedGroup('');
      document.getElementById('assignmentFile').value = "";
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

          <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} required>
            <option value="">Select a Group</option>
            {groups.map(group => (<option key={group.id} value={group.id}>{group.name}</option>))}
          </select>
          <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Assignment'}</button>
        </form>
        {message && <p className="success-message">{message}</p>}
      </div>

      <div className="list-container">
        <h3>
          Created Assignments
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{float: 'right', padding: '5px'}}>
            <option value="all">All Groups</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </h3>
        <table className="students-table">
          <thead><tr><th>Name</th><th>Group</th><th>File</th><th>Actions</th></tr></thead>
          <tbody>
            {filteredAssignments.map(assignment => (
              <tr key={assignment.id}>
                <td>{assignment.name}</td>
                <td>{assignment.groups ? assignment.groups.name : 'N/A'}</td>
                <td>{assignment.link_url ? (<a href={assignment.link_url} target="_blank" rel="noopener noreferrer">View File</a>) : ('No file')}</td>
                <td><button onClick={() => handleDeleteAssignment(assignment.id)} className="delete-btn">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AssignmentsPage;