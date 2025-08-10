import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Dashboard.css';

function AttendancePage() {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10)); // آج کی تاریخ
  const [attendance, setAttendance] = useState({}); // حاضری کا ریکارڈ رکھنے کے لیے
  const [message, setMessage] = useState('');

  // گروپس حاصل کریں
  useEffect(() => {
    async function fetchGroups() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: groupsData } = await supabase.from('groups').select('id, name').eq('teacher_id', user.id);
        setGroups(groupsData || []);
      }
    }
    fetchGroups();
  }, []);

  // جب گروپ منتخب ہو تو اس کے اسٹوڈنٹس لائیں
  const handleGroupChange = async (groupId) => {
    setSelectedGroup(groupId);
    if (!groupId) {
      setStudents([]);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('group_id', groupId);
    
    if (error) console.error('Error fetching students:', error);
    else setStudents(data || []);
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    setLoading(true);
    setMessage('');
    
    const recordsToSave = Object.entries(attendance).map(([studentId, status]) => ({
      student_id: studentId,
      group_id: selectedGroup,
      attendance_date: attendanceDate,
      status: status
    }));

    if (recordsToSave.length === 0) {
      setMessage('Please mark attendance for at least one student.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('attendance').upsert(recordsToSave, { onConflict: 'student_id, attendance_date' });
    
    if (error) {
      setMessage('Error saving attendance: ' + error.message);
    } else {
      setMessage('Attendance saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
    setLoading(false);
  };


  return (
    <div className="dashboard-container">
      <h2>Mark Attendance</h2>
      
      <div className="form-container">
        <select value={selectedGroup} onChange={(e) => handleGroupChange(e.target.value)}>
          <option value="">Select a Group</option>
          {groups.map(group => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>
        <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} />
      </div>

      {message && <p className="success-message">{message}</p>}

      {selectedGroup && (
        <div className="list-container">
          <h3>Students List</h3>
          <table className="students-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td>{student.full_name}</td>
                  <td>
                    <div className="attendance-options">
                      <label>
                        <input type="radio" name={`attendance-${student.id}`} onChange={() => handleAttendanceChange(student.id, 'Present')} />
                        Present
                      </label>
                      <label>
                        <input type="radio" name={`attendance-${student.id}`} onChange={() => handleAttendanceChange(student.id, 'Absent')} />
                        Absent
                      </label>
                       <label>
                        <input type="radio" name={`attendance-${student.id}`} onChange={() => handleAttendanceChange(student.id, 'Leave')} />
                        Leave
                      </label>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleSaveAttendance} disabled={loading} className="auth-button" style={{marginTop: '20px'}}>
            {loading ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      )}
    </div>
  );
}

export default AttendancePage;