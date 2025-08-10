import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './AuthForm.css';

function AuthForm() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.signInWithPassword({ email, password });
      if (!user) throw new Error("Login failed.");
      
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile.role === 'teacher') navigate('/teacher-dashboard');
      else if (profile.role === 'student') navigate('/student-dashboard');
      else throw new Error('No role found for this user.');

    } catch (error) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="scene">
      <div className="cube">
        <div className="face front">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Login</h2>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
        <div className="face back"></div>
        <div className="face right"></div>
        <div className="face left"></div>
        <div className="face top"></div>
        <div className="face bottom"></div>
      </div>
    </div>
  );
}

export default AuthForm;