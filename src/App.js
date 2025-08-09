import './App.css'
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { Outlet, useNavigate } from 'react-router-dom'
import TeacherSidebar from './components/TeacherSidebar.js';
import StudentSidebar from './components/StudentSidebar.js';

function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null); // پروفائل کے لیے نئی اسٹیٹ
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setProfile(profileData);
      }
      setLoading(false);
    };

    fetchSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session) {
          navigate('/login');
        } else {
            // لاگ ان ہونے پر پروفائل دوبارہ حاصل کریں
            fetchSessionAndProfile();
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut()
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="app-container">
      <header className="top-bar">
        <span>WELCOME TO CLASSROOM</span>
      </header>
      <div className="app-body">
        {/* کردار کی بنیاد پر سائڈبار دکھائیں */}
        {profile?.role === 'teacher' && <TeacherSidebar onLogout={handleLogout} />}
        {profile?.role === 'student' && <StudentSidebar onLogout={handleLogout} />}
        
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default App