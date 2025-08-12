import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Dashboard.css';

function ManageStudentsPage() {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedGroupForNewStudent, setSelectedGroupForNewStudent] = useState('');
  const [message, setMessage] = useState('');
  
  const [groups, setGroups] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filter, setFilter] = useState('all');

  const [editingStudent, setEditingStudent] = useState(null);
  const [newGroupId, setNewGroupId] = useState('');

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: groupsData } = await supabase.from('groups').select('id, name').eq('teacher_id', user.id);
      setGroups(groupsData || []);

      const { data: studentsData } = await supabase.from('profiles').select(`id, full_name, group_id`).eq('role', 'student');
      setAllStudents(studentsData || []);
      setFilteredStudents(studentsData || []);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredStudents(allStudents);
    } else if (filter === 'unassigned') {
      setFilteredStudents(allStudents.filter(s => !s.group_id));
    } else {
      setFilteredStudents(allStudents.filter(s => s.group_id === parseInt(filter)));
    }
  }, [filter, allStudents]);

  const handleUpdateStudentGroup = async () => {
    if (!newGroupId || !editingStudent) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ group_id: parseInt(newGroupId) })
      .eq('id', editingStudent.id);
      
    if (error) {
      alert("Error updating group: " + error.message);
    } else {
      alert("Student's group updated successfully!");
      setEditingStudent(null);
      fetchData();
    }
  };
  
  // --- ڈیلیٹ کا فنکشن یہاں واپس شامل کیا گیا ہے ---
  const handleDeleteStudent = async (studentId) => {
    if (window.confirm("Are you sure you want to delete this student and all their records?")) {
      // پہلے Auth سے صارف کو ڈیلیٹ کرنے کی کوشش کریں (یہ ایڈمن رول کے ساتھ کام کرے گا)
      // فی الحال، ہم صرف پروفائل ڈیلیٹ کر رہے ہیں
      const { error } = await supabase.from('profiles').delete().eq('id', studentId);
      if (error) {
        alert("Error deleting student profile: " + error.message);
      } else {
        alert("Student deleted successfully.");
        fetchData(); // لسٹ کو تازہ کریں
      }
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    if (currentSession) {
      await supabase.auth.setSession(currentSession);
    }

    if (authError) {
      setMessage(`Error: ${authError.message}`);
      setLoading(false);
      return;
    }

    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName, role: 'student', group_id: selectedGroupForNewStudent || null })
        .eq('id', authData.user.id);

      if (profileError) {
        setMessage(`Error: ${profileError.message}`);
      } else {
        setMessage('Student added successfully!');
        fetchData();
        setFullName(''); setEmail(''); setPassword(''); setSelectedGroupForNewStudent('');
        setTimeout(() => setMessage(''), 3000);
      }
    }
    setLoading(false);
  };
  
  const getGroupNameById = (groupId) => {
    if (!groupId) return 'Not Assigned';
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : 'Unknown Group';
  };

  return (
    <div className="dashboard-container">
      {editingStudent && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Edit Group for {editingStudent.full_name}</h3>
            <select onChange={(e) => setNewGroupId(e.target.value)} defaultValue={editingStudent.group_id || ""}>
              <option value="">Assign to a group</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <div className="modal-actions">
              <button onClick={handleUpdateStudentGroup} className="submit-btn">Save</button>
              <button onClick={() => setEditingStudent(null)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <h2>Manage Students</h2>
      
      <div className="form-container">
        <h3>Add a New Student</h3>
        <form className="add-student-form" onSubmit={handleAddStudent}>
          <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Initial Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <select value={selectedGroupForNewStudent} onChange={(e) => setSelectedGroupForNewStudent(e.target.value)}>
            <option value="">Assign to a group (optional)</option>
            {groups.map(group => (<option key={group.id} value={group.id}>{group.name}</option>))}
          </select>
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Student'}
          </button>
        </form>
        {message && <p className="success-message">{message}</p>}
      </div>

      <div className="list-container">
        <h3>
          All Students
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{float: 'right', padding: '5px'}}>
            <option value="all">All Students</option>
            <option value="unassigned">Unassigned Students</option>
            <hr/>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </h3>
        <table className="students-table">
          <thead><tr><th>Full Name</th><th>Group</th><th>Actions</th></tr></thead>
          <tbody>
            {filteredStudents.map(student => (
              <tr key={student.id}>
                <td>{student.full_name}</td>
                <td>{getGroupNameById(student.group_id)}</td>
                <td style={{display: 'flex', gap: '5px'}}>
                  <button onClick={() => setEditingStudent(student)} className="auth-button" style={{backgroundColor: '#ffc107'}}>Edit</button>
                  {/* ڈیلیٹ کا بٹن یہاں صحیح طریقے سے کام کر رہا ہے */}
                  <button onClick={() => handleDeleteStudent(student.id)} className="delete-btn">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageStudentsPage;