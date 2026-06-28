import React, { useState } from 'react';
import useAllUsers from '../hooks/useAllUsers';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import { Button, CircularProgress } from '@mui/material';

const ORANGE = '#ffaf1b';
const DARK_BG = '#181a20';
const CARD_BG = '#23263a';
const TEXT_COLOR = 'white';
const HEADER_COLOR = ORANGE;

export default function SeeUsers() {
  const { users, loading, error, refetch } = useAllUsers();
  // Exclude admins
  const filtered = users.filter(u => !u.admin);
  // Track which rows have password visible
  const [visible, setVisible] = useState({});
  const [bonus, setBonus] = useState({});
  const [submitting, setSubmitting] = useState(null);
  const [bonusError, setBonusError] = useState(null);

  const toggleVisibility = (username) => {
    setVisible(v => ({ ...v, [username]: !v[username] }));
  };

  const handleAddBonus = async (user) => {
    const points = Number(bonus[user._id]);
    if (!points || isNaN(points)) return;
    setSubmitting(user._id);
    setBonusError(null);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${API_BASE}/user/${user._id}/bonus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add bonus');
      setBonus(b => ({ ...b, [user._id]: '' }));
      refetch();
    } catch (err) {
      setBonusError(err.message);
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div style={{ background: CARD_BG, borderRadius: 16, maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem', boxShadow: '0 4px 32px 0 rgba(0,0,0,0.18)' }}>
      <h2 style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 24, marginBottom: 24, textAlign: 'center' }}>All Users</h2>
      {loading && <div style={{ color: TEXT_COLOR, textAlign: 'center' }}>Loading...</div>}
      {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
      {bonusError && <div style={{ color: 'red', textAlign: 'center', marginBottom: 12 }}>{bonusError}</div>}
      {!loading && !error && (
        <table style={{ width: '100%', borderCollapse: 'collapse', color: TEXT_COLOR }}>
          <thead>
            <tr style={{ background: 'rgba(255,175,27,0.08)' }}>
              <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 16, padding: '10px 16px', textAlign: 'left' }}>Username</th>
              <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 16, padding: '10px 16px', textAlign: 'left' }}>Full Name</th>
              <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 16, padding: '10px 16px', textAlign: 'left' }}>Password</th>
              <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 16, padding: '10px 16px', textAlign: 'center' }}>Score</th>
              <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 16, padding: '10px 16px', textAlign: 'center' }}>Bonus</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, idx) => (
              <tr key={user.username} style={{ borderBottom: '1px solid #31344b', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,175,27,0.03)' }}>
                <td style={{ padding: '14px 16px', fontWeight: 500 }}>{user.username}</td>
                <td style={{ padding: '14px 16px', fontWeight: 500 }}>{user.displayName}</td>
                <td style={{ padding: '14px 16px', fontWeight: 500 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
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
                  </span>
                </td>
                <td style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'center', color: ORANGE }}>{user.score}</td>
                <td style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <input
                    type="number"
                    placeholder="pts"
                    style={{ width: 64, marginRight: 8, background: DARK_BG, color: 'white', border: '1px solid #444', borderRadius: 4, padding: '4px 6px' }}
                    value={bonus[user._id] || ''}
                    onChange={e => setBonus(b => ({ ...b, [user._id]: e.target.value }))}
                    disabled={submitting === user._id}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ bgcolor: ORANGE, color: DARK_BG, fontWeight: 600, borderRadius: 2, px: 2, textTransform: 'none', ':hover': { bgcolor: '#ff9900' } }}
                    onClick={() => handleAddBonus(user)}
                    disabled={submitting === user._id || !bonus[user._id]}
                  >
                    {submitting === user._id ? <CircularProgress size={16} sx={{ color: DARK_BG }} /> : 'Add'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p style={{ color: '#b0b3c6', fontSize: 13, marginTop: 16, textAlign: 'center' }}>
        Tip: enter a positive number to award points, or a negative number to deduct.
      </p>
    </div>
  );
}
