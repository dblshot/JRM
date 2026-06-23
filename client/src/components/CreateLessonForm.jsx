import React, { useState } from 'react';
import { Alert, CircularProgress } from '@mui/material';

const ORANGE = '#ffaf1b';
const DARK_BG = '#181a20';
const CARD_BG = '#23263a';
const LABEL_COLOR = ORANGE;
const PLACEHOLDER_COLOR = '#b0b3c6';

export default function CreateLessonForm({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [slidesLink, setSlidesLink] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${API_BASE}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, videoLink, slidesLink, notes })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create lesson');
      setSuccess(true);
      setTitle('');
      setVideoLink('');
      setSlidesLink('');
      setNotes('');
      if (onSubmit) onSubmit(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: CARD_BG, borderRadius: 16, maxWidth: 400, margin: '0 auto', padding: '2rem 1.5rem', boxShadow: '0 4px 32px 0 rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2 style={{ color: ORANGE, fontWeight: 700, fontSize: 24, marginBottom: 4, textAlign: 'center' }}>Create Lesson</h2>
      <p style={{ color: PLACEHOLDER_COLOR, fontSize: 15, marginBottom: 24, textAlign: 'center' }}>
        Fill in the details below to add a new lesson.
      </p>
      <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ marginBottom: 10 }}>
          <label htmlFor="title" style={{ color: LABEL_COLOR, fontWeight: 600, fontSize: 15, marginBottom: 6, display: 'block' }}>Title *</label>
          <input
            id="title"
            type="text"
            placeholder="Enter lesson title"
            value={title}
            onChange={e => setTitle(e.target.value)}
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
          <label htmlFor="videoLink" style={{ color: LABEL_COLOR, fontWeight: 600, fontSize: 15, marginBottom: 6, display: 'block' }}>Video Link</label>
          <input
            id="videoLink"
            type="url"
            placeholder="Enter video link"
            value={videoLink}
            onChange={e => setVideoLink(e.target.value)}
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
          <label htmlFor="slidesLink" style={{ color: LABEL_COLOR, fontWeight: 600, fontSize: 15, marginBottom: 6, display: 'block' }}>Slides Link</label>
          <input
            id="slidesLink"
            type="url"
            placeholder="Enter slides link"
            value={slidesLink}
            onChange={e => setSlidesLink(e.target.value)}
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
          <label htmlFor="notes" style={{ color: LABEL_COLOR, fontWeight: 600, fontSize: 15, marginBottom: 6, display: 'block' }}>Notes</label>
          <textarea
            id="notes"
            placeholder="Enter notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
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
              resize: 'none',
            }}
            onFocus={e => (e.target.style.border = `1.5px solid ${ORANGE}`)}
            onBlur={e => (e.target.style.border = '1.5px solid #31344b')}
          />
        </div>
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 8,
            background: ORANGE,
            color: CARD_BG,
            fontWeight: 'bold',
            fontSize: 18,
            marginTop: 12,
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'background 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
          disabled={loading}
        >
          {loading && <CircularProgress size={22} sx={{ color: CARD_BG }} />}
          {loading ? 'Creating...' : 'Create Lesson'}
        </button>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>Lesson created successfully!</Alert>}
      </form>
    </div>
  );
}
