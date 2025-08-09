import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Dashboard.css'; // درست امپورٹ لائن

function MyGroupsPage() { 
  const [loading, setLoading] = useState(true);
  const [groupName, setGroupName] = useState('');
  const [groups, setGroups] = useState([]);
  const [user, setUser] = useState(null);

  async function fetchGroups() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data, error } = await supabase
        .from('groups')
        .select('id, name, created_at')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching groups:', error);
      } else {
        setGroups(data);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    const { data, error } = await supabase
      .from('groups')
      .insert({ name: groupName, teacher_id: user.id })
      .select()
      .single();

    if (error) {
      alert(error.message);
    } else {
      setGroups([data, ...groups]);
      setGroupName('');
    }
  };

  if (loading) {
    return <div>Loading your groups...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="form-container">
        <h3>Create a New Group</h3>
        <form onSubmit={handleCreateGroup}>
          <input
            type="text"
            placeholder="Enter group name (e.g., Class 9)"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <button type="submit">Create Group</button>
        </form>
      </div>

      <div className="list-container">
        <h3>Your Groups</h3>
        {groups.length === 0 ? (
          <p>You have not created any groups yet.</p>
        ) : (
          <ul>
            {groups.map((group) => (
              <li key={group.id}>{group.name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default MyGroupsPage;