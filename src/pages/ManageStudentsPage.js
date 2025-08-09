import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Dashboard.css'; // درست امپورٹ لائن

function ManageStudentsPage() {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [message, setMessage] = useState('');
  
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [user, setUser] = useState(null);

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('id, name')
        .eq('teacher_id', user.id);
      
      if (groupsError) console.error('Error fetching groups', groupsError);
      else setGroups(groupsData || []);

      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('role', 'student');
      
      if (studentsError) console.error('Error fetching students', studentsError);
      else setStudents(studentsData || []);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (authError) {
      setMessage(`Error: ${authError.message}`);
      setLoading(false);
      return;
    }

    if (authData.user) {
      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName, 
          role: 'student', 
          group_id: selectedGroup || null 
        })
        .eq('id', authData.user.id)
        .select()
        .single();

      if (profileError) {
        setMessage(`Error: ${profileError.message}`);
      } else {
        setMessage('Student added successfully!');
        setStudents([...students, updatedProfile]);
        setFullName('');
        setEmail('');
        setPassword('');
        setSelectedGroup('');
        setTimeout(() => setMessage(''), 3000);
      }
    }
    setLoading(false);
  };

  return (
    <div className="dashboard-container">
      <h2>Manage Students</h2>
      
      <div className="form-container">
        <h3>Add a New Student</h3>
        <form className="add-student-form" onSubmit={handleAddStudent}>
          <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Initial Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
            <option value="">Assign to a group (optional)</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Student'}
          </button>
        </form>
        {message && <p className="success-message">{message}</p>}
      </div>

      <div className="list-container">
        <h3>All Students</h3>
        {students.length === 0 ? (
          <p>No students added yet.</p>
        ) : (
          <ul>
            {students.map(student => (
              <li key={student.id}>{student.full_name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ManageStudentsPage;