import React, { useState } from 'react';
import useAllUsers from '../hooks/useAllUsers';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';

const ORANGE = '#ffaf1b';
const CARD_BG = '#23263a';
const TEXT_COLOR = 'white';
const HEADER_COLOR = ORANGE;

export default function SeeUsers() {
  const { users, loading, error } = useAllUsers();
  // Exclude admins
  const filtered = users.filter(u => !u.admin);
  // Track which rows have password visible
  const [visible, setVisible] = useState({});

  const toggleVisibility = (username) => {
    setVisible(v => ({ ...v, [username]: !v[username] }));
  };

  return (
    <div style={{ background: CARD_BG, borderRadius: 16, maxWidth: 600, margin: '0 auto', padding: '2rem 1.5rem', boxShadow: '0 4px 32px 0 rgba(0,0,0,0.18)' }}>
      <h2 style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 24, marginBottom: 24, textAlign: 'center' }}>All Users</h2>
      {loading && <div style={{ color: TEXT_COLOR, textAlign: 'center' }}>Loading...</div>}
      {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
      {!loading && !error && (
        <table style={{ width: '100%', borderCollapse: 'collapse', color: TEXT_COLOR }}>
          <thead>
            <tr style={{ background: 'rgba(255,175,27,0.08)' }}>
              <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 16, padding: '10px 20px', textAlign: 'left' }}>Username</th>
              <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 16, padding: '10px 20px', textAlign: 'left' }}>Full Name</th>
              <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 16, padding: '10px 20px', textAlign: 'left' }}>Password</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, idx) => (
              <tr key={user.username} style={{ borderBottom: '1px solid #31344b', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,175,27,0.03)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 500 }}>{user.username}</td>
                <td style={{ padding: '14px 20px', fontWeight: 500 }}>{user.displayName}</td>
                <td style={{ padding: '14px 20px', fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                  <span style={{ letterSpacing: 2, marginRight: 8 }}>
                    {visible[user.username] ? user.password : '•'.repeat(user.password.length || 8)}
                  </span>
                  <IconButton
                    onClick={() => toggleVisibility(user.username)}
                    size="small"
                    sx={{ color: ORANGE }}
                    aria-label={visible[user.username] ? 'Hide password' : 'Show password'}
                  >
                    {visible[user.username] ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
