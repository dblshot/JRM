import React, { useEffect, useState } from 'react';
import { CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const ORANGE = '#ffaf1b';
const CARD_BG = '#23263a';
const TEXT_COLOR = 'white';
const HEADER_COLOR = ORANGE;
const GRAY = '#b0b3c6';

const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

function stars(n) {
  return '⭐'.repeat(Number(n) || 0);
}

export default function ViewFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      setError(null);
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL;
        const res = await fetch(`${API_BASE}/feedback`);
        if (!res.ok) throw new Error('Failed to fetch feedback');
        const data = await res.json();
        setFeedbacks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  const avg = (field) => {
    if (!feedbacks.length) return '—';
    const sum = feedbacks.reduce((acc, f) => acc + (Number(f[field]) || 0), 0);
    return (sum / feedbacks.length).toFixed(1);
  };

  return (
    <div style={{ background: CARD_BG, borderRadius: 16, maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem', boxShadow: '0 4px 32px 0 rgba(0,0,0,0.18)' }}>
      <h2 style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 24, marginBottom: 8, textAlign: 'center' }}>
        Course Feedback
      </h2>
      <p style={{ color: GRAY, fontSize: 14, marginBottom: 20, textAlign: 'center' }}>
        {feedbacks.length} response{feedbacks.length === 1 ? '' : 's'}
        {feedbacks.length > 0 && (
          <> · Avg content: {avg('courseContentRating')} · Avg instructor: {avg('instructorRating')}</>
        )}
      </p>

      {loading && <div style={{ color: TEXT_COLOR, textAlign: 'center' }}><CircularProgress sx={{ color: ORANGE }} /></div>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {!loading && !error && feedbacks.length === 0 && (
        <div style={{ color: TEXT_COLOR, textAlign: 'center' }}>No feedback submitted yet.</div>
      )}

      {!loading && !error && feedbacks.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: TEXT_COLOR }}>
            <thead>
              <tr style={{ background: 'rgba(255,175,27,0.08)' }}>
                <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 14, padding: '10px 12px', textAlign: 'left' }}>Student</th>
                <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 14, padding: '10px 12px', textAlign: 'center' }}>Content</th>
                <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 14, padding: '10px 12px', textAlign: 'center' }}>Instructor</th>
                <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 14, padding: '10px 12px', textAlign: 'left' }}>Favorite Activity</th>
                <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 14, padding: '10px 12px', textAlign: 'left' }}>Top Skill</th>
                <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 14, padding: '10px 12px', textAlign: 'center' }}>Recommend</th>
                <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 14, padding: '10px 12px', textAlign: 'center' }}>Date</th>
                <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 14, padding: '10px 12px', textAlign: 'center' }}></th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((f, idx) => (
                <tr key={f._id} style={{ borderBottom: '1px solid #31344b', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,175,27,0.03)' }}>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{f.displayName || f.username || '—'}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }} title={RATING_LABELS[f.courseContentRating]}>
                    {stars(f.courseContentRating)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }} title={RATING_LABELS[f.instructorRating]}>
                    {stars(f.instructorRating)}
                  </td>
                  <td style={{ padding: '12px' }}>{f.favoriteActivity}</td>
                  <td style={{ padding: '12px' }}>{f.mostImportantSkill}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{f.recommendToFriend || '—'}</td>
                  <td style={{ padding: '12px', textAlign: 'center', fontSize: 13, color: GRAY }}>
                    {f.submittedAt ? new Date(f.submittedAt).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setSelected(f)}
                      sx={{ color: ORANGE, borderColor: ORANGE, textTransform: 'none', fontWeight: 600 }}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { background: CARD_BG, color: TEXT_COLOR, borderRadius: 3 } }}
      >
        <DialogTitle sx={{ color: HEADER_COLOR, fontWeight: 700, background: 'rgba(255,175,27,0.08)' }}>
          Feedback — {selected?.displayName || selected?.username}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selected && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
              <Detail label="1. Course content" value={`${stars(selected.courseContentRating)} (${RATING_LABELS[selected.courseContentRating]})`} />
              <Detail label="2. Favorite activity" value={selected.favoriteActivity} />
              <Detail label="3. Instructor" value={`${stars(selected.instructorRating)} (${RATING_LABELS[selected.instructorRating]})`} />
              <Detail label="4. Most important skill" value={selected.mostImportantSkill} />
              <Detail label="5. What can we improve?" value={selected.improvementSuggestion || '—'} />
              <Detail label="Bonus. Recommend to a friend?" value={selected.recommendToFriend || '—'} />
              <Detail
                label="Submitted"
                value={selected.submittedAt ? new Date(selected.submittedAt).toLocaleString() : '—'}
              />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)} sx={{ color: ORANGE, fontWeight: 600, textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <div style={{ color: ORANGE, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{label}</div>
      <div style={{ color: TEXT_COLOR, whiteSpace: 'pre-wrap' }}>{value}</div>
    </div>
  );
}
