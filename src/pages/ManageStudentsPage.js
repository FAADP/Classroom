import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Dashboard.css';

function ManageStudentsPage() {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [message, setMessage] = useState('');
  
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);

  // یہ فنکشن اب تمام اسٹوڈنٹس اور گروپس لائے گا
  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // گروپس حاصل کریں
      const { data: groupsData } = await supabase.from('groups').select('id, name').eq('teacher_id', user.id);
      setGroups(groupsData || []);

      // تمام اسٹوڈنٹس حاصل کریں (سادہ طریقہ)
      const { data: studentsData, error } = await supabase
        .from('profiles')
        .select(`id, full_name, group_id`) // صرف group_id حاصل کریں
        .eq('role', 'student');
      
      if (error) console.error("Error fetching students:", error);
      else setStudents(studentsData || []);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);
  
  const handleDeleteStudent = async (studentId) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      const { error } = await supabase.from('profiles').delete().eq('id', studentId);
      if (error) {
        alert("Error deleting student: " + error.message);
      } else {
        setStudents(students.filter(student => student.id !== studentId));
        alert("Student profile deleted successfully.");
      }
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    // 1. موجودہ ٹیچر کا سیشن محفوظ کریں
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    
    // 2. نیا صارف (اسٹوڈنٹ) بنائیں
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

    // 3. فوراً ٹیچر کا سیشن واپس بحال کریں
    if (currentSession) {
      await supabase.auth.setSession(currentSession);
    }

    if (authError) {
      setMessage(`Error: ${authError.message}`);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // 4. اب نئے اسٹوڈنٹ کی پروفائل اپڈیٹ کریں
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName, 
          role: 'student', 
          group_id: selectedGroup || null
        })
        .eq('id', authData.user.id);

      if (profileError) {
        setMessage(`Error: ${profileError.message}`);
      } else {
        setMessage('Student added successfully!');
        // 5. لسٹ کو اپڈیٹ کرنے کے لیے ڈیٹا دوبارہ حاصل کریں
        fetchData();
        // فارم کو ری سیٹ کریں
        setFullName('');
        setEmail('');
        setPassword('');
        setSelectedGroup('');
        setTimeout(() => setMessage(''), 3000);
      }
    }
    setLoading(false);
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
      
      <div className="form-container">
        <h3>Add a New Student</h3>
        <form className="add-student-form" onSubmit={handleAddStudent}>
          <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Initial Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
            <option value="">Assign to a group (optional)</option>
            {groups.map(group => (<option key={group.id} value={group.id}>{group.name}</option>))}
          </select>
          <button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Student'}</button>
        </form>
        {message && <p className="success-message">{message}</p>}
      </div>

      <div className="list-container">
        <h3>All Students</h3>
        {students.length === 0 ? (<p>No students added yet.</p>) : (
          <table className="students-table">
            <thead><tr><th>Full Name</th><th>Group</th><th>Actions</th></tr></thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td>{student.full_name}</td>
                  <td>{getGroupNameById(student.group_id)}</td>
                  <td><button onClick={() => handleDeleteStudent(student.id)} className="delete-btn">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ManageStudentsPage;