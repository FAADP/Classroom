import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Dashboard.css';

function ProfileSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  const [fullName, setFullName] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(''); // تصویر کے لیے نئی اسٹیٹ
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, about_me, avatar_url') // avatar_url بھی حاصل کریں
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setFullName(profile.full_name || '');
          setAboutMe(profile.about_me || '');
          setAvatarUrl(profile.avatar_url || '');
        }
      }
      setLoading(false);
    }
    getProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase
      .from('profiles')
      .update({ 
        full_name: fullName, 
        about_me: aboutMe,
        avatar_url: avatarUrl // avatar_url کو بھی اپڈیٹ کریں
      })
      .eq('id', user.id);

    if (error) {
      setMessage('Error updating profile: ' + error.message);
    } else {
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
    setLoading(false);
  };

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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <h2>Profile Settings</h2>
      
      <div className="form-container">
        <h3>Update Your Information</h3>
        {/* تصویر یہاں دکھائیں */}
        {avatarUrl && <img src={avatarUrl} alt="Profile Avatar" width="150" style={{borderRadius: '50%', margin: '0 auto 20px'}} />}
        <form className="add-student-form" onSubmit={handleUpdateProfile}>
          <label htmlFor="fullName">Full Name</label>
          <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          
          <label htmlFor="aboutMe">About Me</label>
          <textarea id="aboutMe" value={aboutMe} onChange={(e) => setAboutMe(e.target.value)} />

          {/* تصویر کا لنک داخل کرنے کے لیے نیا خانہ */}
          <label htmlFor="avatarUrl">Avatar URL</label>
          <input id="avatarUrl" type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://example.com/image.png" />

          <button type="submit" disabled={loading}>Update Profile</button>
        </form>
      </div>

      <div className="form-container">
        <h3>Change Password</h3>
        <form className="add-student-form" onSubmit={handleChangePassword}>
          <label htmlFor="password">New Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password" />
          
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />

          <button type="submit" disabled={loading}>Change Password</button>
        </form>
      </div>
      {message && <p className="success-message" style={{marginTop: '20px'}}>{message}</p>}
    </div>
  );
}

export default ProfileSettingsPage;