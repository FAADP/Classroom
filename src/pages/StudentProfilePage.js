import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Dashboard.css';

function StudentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [teacherProfile, setTeacherProfile] = useState(null);

  // پاس ورڈ فارم کے لیے اسٹیٹس
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function getTeacherProfile() {
      // ٹیچر کی پروفائل حاصل کریں
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, about_me, avatar_url')
        .eq('role', 'teacher')
        .single(); // فرض کریں کہ صرف ایک ٹیچر ہے

      if (error) console.error('Error fetching teacher profile:', error);
      else setTeacherProfile(data);
      setLoading(false);
    }
    getTeacherProfile();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
        setMessage('Password should be at least 6 characters.');
        return;
    }
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.updateUser({ password: password });
    if (error) {
      setMessage('Error changing password: ' + error.message);
    } else {
      setMessage('Password changed successfully!');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => setMessage(''), 3000);
    }
    setLoading(false);
  };
  
  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard-container">
      <h2>Profile Settings</h2>

      {/* ٹیچر کی پروفائل دکھائیں */}
      {teacherProfile && (
        <div className="list-container">
          <h3>Teacher Information</h3>
          {teacherProfile.avatar_url && <img src={teacherProfile.avatar_url} alt="Teacher Avatar" width="150" style={{borderRadius: '50%', margin: '0 auto 20px', display: 'block'}} />}
          <h4>{teacherProfile.full_name}</h4>
          <p>{teacherProfile.about_me}</p>
        </div>
      )}

      {/* پاس ورڈ تبدیل کرنے کا فارم */}
      <div className="form-container">
        <h3>Change Your Password</h3>
        <form className="add-student-form" onSubmit={handleChangePassword}>
          <label htmlFor="password">New Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password" />
          
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />

          <button type="submit" disabled={loading}>Change Password</button>
        </form>
        {message && <p className="success-message" style={{marginTop: '20px'}}>{message}</p>}
      </div>
    </div>
  );
}

export default StudentProfilePage;