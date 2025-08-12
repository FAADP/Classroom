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
      // یہاں `==` کی جگہ `===` استعمال کیا گیا ہے
      setFilteredStudents(allStudents.filter(s => s.group_id === parseInt(filter)));
    }
  }, [filter, allStudents]);

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
        fetchData(); // لسٹ کو اپڈیٹ کرنے کے لیے ڈیٹا دوبارہ حاصل کریں
        setFullName(''); setEmail(''); setPassword(''); setSelectedGroupForNewStudent('');
        setTimeout(() => setMessage(''), 3000);
      }
    }
    setLoading(false);
  };
  
  const handleDeleteStudent = async (studentId) => {
    // ... ڈیلیٹ کا فنکشن ...
  };
  
  // یہ فنکشن گروپ ID کی بنیاد پر گروپ کا نام تلاش کرے گا
  const getGroupNameById = (groupId) => {
    if (!groupId) return 'Not Assigned';
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : 'Unknown Group';
  };

  return (
    <div className="dashboard-container">
      <h2>Manage Students</h2>
      
      {/* "Add Student" کا فارم واپس شامل کیا گیا ہے */}
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
                <td><button onClick={() => handleDeleteStudent(student.id)} className="delete-btn">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageStudentsPage;