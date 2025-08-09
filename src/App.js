import './App.css';
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import TeacherSidebar from './components/TeacherSidebar.js';
import StudentSidebar from './components/StudentSidebar.js';

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single(); // .single() کو واپس استعمال کر رہے ہیں کیونکہ ڈیٹا اب صاف ہے

        if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else {
          setProfile(profileData);
        }
      }
      setLoading(false);
    };

    fetchSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        // --- کلیدی تبدیلی یہاں ہے ---
        // اب ہم یہاں پروفائل دوبارہ حاصل نہیں کر رہے
        setSession(session);
        if (!session) {
          navigate('/login');
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!loading && !session && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [session, loading, location, navigate]);


  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!session) {
    return null; 
  }
  
  return (
    <div className="app-container">
      <header className="top-bar">
        <span>WELCOME TO CLASSROOM</span>
      </header>
      <div className="app-body">
        {profile?.role === 'teacher' && <TeacherSidebar onLogout={() => supabase.auth.signOut()} />}
        {profile?.role === 'student' && <StudentSidebar onLogout={() => supabase.auth.signOut()} />}
        
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default App;