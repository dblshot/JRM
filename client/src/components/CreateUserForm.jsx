import React, { useState } from 'react';
import { Button, IconButton, Alert, CircularProgress } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import useCreateUser from '../hooks/useCreateUser';

const ORANGE = '#ffaf1b';
const DARK_BG = '#181a20';
const CARD_BG = '#23263a';
const LABEL_COLOR = ORANGE;
const PLACEHOLDER_COLOR = '#b0b3c6';

export default function CreateUserForm({ onSubmit }) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { createUser, loading, error, success } = useCreateUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await createUser({ fullName, username, password });
    if (result) {
      setFullName('');
      setUsername('');
      setPassword('');
      if (onSubmit) onSubmit(result);
    }
  };

  return (
    <div
      style={{
        background: CARD_BG,
        borderRadius: 16,
        maxWidth: 320,
        margin: '0 auto',
        padding: '2rem 1.5rem 1.5rem 1.5rem',
        boxShadow: '0 4px 32px 0 rgba(0,0,0,0.18)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h2 style={{ color: ORANGE, fontWeight: 700, fontSize: 24, marginBottom: 4, textAlign: 'center' }}>Create User</h2>
      <p style={{ color: PLACEHOLDER_COLOR, fontSize: 15, marginBottom: 24, textAlign: 'center' }}>
        Fill in the details below to add a new user.
      </p>
      <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ marginBottom: 10 }}>
          <label htmlFor="fullName" style={{ color: LABEL_COLOR, fontWeight: 600, fontSize: 15, marginBottom: 6, display: 'block' }}>Full Name</label>
          <input
            id="fullName"
            type="text"
            placeholder="Enter full name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 8,
              background: DARK_BG,
              border: '1.5px solid #31344b',
              color: 'white',
              fontSize: 16,
              outline: 'none',
              marginTop: 2,
              marginBottom: 0,
              transition: 'border 0.2s',
            }}
            onFocus={e => (e.target.style.border = `1.5px solid ${ORANGE}`)}
            onBlur={e => (e.target.style.border = '1.5px solid #31344b')}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label htmlFor="username" style={{ color: LABEL_COLOR, fontWeight: 600, fontSize: 15, marginBottom: 6, display: 'block' }}>Username</label>
          <input
            id="username"
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 8,
              background: DARK_BG,
              border: '1.5px solid #31344b',
              color: 'white',
              fontSize: 16,
              outline: 'none',
              marginTop: 2,
              marginBottom: 0,
              transition: 'border 0.2s',
            }}
            onFocus={e => (e.target.style.border = `1.5px solid ${ORANGE}`)}
            onBlur={e => (e.target.style.border = '1.5px solid #31344b')}
          />
        </div>
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <label htmlFor="password" style={{ color: LABEL_COLOR, fontWeight: 600, fontSize: 15, marginBottom: 6, display: 'block' }}>Password</label>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 44px 12px 14px',
                borderRadius: 8,
                background: DARK_BG,
                border: '1.5px solid #31344b',
                color: 'white',
                fontSize: 16,
                outline: 'none',
                marginTop: 2,
                marginBottom: 0,
                transition: 'border 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={e => (e.target.style.border = `1.5px solid ${ORANGE}`)}
              onBlur={e => (e.target.style.border = '1.5px solid #31344b')}
            />
            <div style={{ position: 'absolute', right: 8, top: 0, bottom: 0, display: 'flex', alignItems: 'center', height: '100%' }}>
              <IconButton
                onClick={() => setShowPassword((show) => !show)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                size="small"
                sx={{ color: ORANGE, p: 1 }}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </div>
          </div>
        </div>
        <Button
          type="submit"
          variant="contained"
          sx={{ bgcolor: ORANGE, color: CARD_BG, fontWeight: 'bold', fontSize: 18, mt: 1.5, borderRadius: 2, boxShadow: 'none', '&:hover': { bgcolor: '#ff9800' } }}
          fullWidth
          disabled={loading}
          startIcon={loading ? <CircularProgress size={22} sx={{ color: CARD_BG }} /> : null}
        >
          {loading ? 'Creating...' : 'Create User'}
        </Button>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>User created successfully!</Alert>}
      </form>
    </div>
  );
}
