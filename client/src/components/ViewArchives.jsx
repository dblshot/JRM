import React, { useEffect, useState, useCallback } from 'react';
import {
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
} from '@mui/material';

const ORANGE = '#ffaf1b';
const CARD_BG = '#23263a';
const DARK_BG = '#181a20';
const TEXT_COLOR = 'white';
const HEADER_COLOR = ORANGE;
const GRAY = '#b0b3c6';
const GREEN = '#4caf50';
const RED = '#ff5252';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function ViewArchives() {
  const [archives, setArchives] = useState([]);
  const [activeRound, setActiveRound] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);
  const [archiveName, setArchiveName] = useState('Junior Marketeer (Round 1)');
  const [newRoundName, setNewRoundName] = useState('Double Shot (Round 2)');
  const [tab, setTab] = useState('leaderboard');

  const fetchArchives = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`${API_BASE}/archives`).then((r) => {
        if (!r.ok) throw new Error('Failed to fetch archives');
        return r.json();
      }),
      fetch(`${API_BASE}/archives/round/active`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ])
      .then(([list, round]) => {
        setArchives(list);
        setActiveRound(round);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch archives');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchArchives();
  }, [fetchArchives]);

  const openArchive = async (id) => {
    setDetailLoading(true);
    setSelected(null);
    setTab('leaderboard');
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/archives/${id}`);
      if (!res.ok) throw new Error('Failed to load archive');
      setSelected(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const runArchiveAndReset = async () => {
    setBusy(true);
    setActionMsg(null);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/archives/archive-and-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          archiveName: archiveName.trim() || 'Junior Marketeer (Round 1)',
          newRoundName: newRoundName.trim() || 'Double Shot (Round 2)',
          note: 'Rebrand: archived JM round, started Double Shot fresh',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Archive failed');
      setActionMsg(
        `Archived “${data.archive.name}” (${data.archive.summary.studentCount} students, ${data.archive.summary.lessonCount} lessons). Fresh round: “${data.newRound.name}”. Kept admins: ${data.keptAdmins.map((a) => a.username).join(', ') || 'none'}.`
      );
      setConfirmOpen(false);
      fetchArchives();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const students = (selected?.data?.users || []).filter((u) => !u.admin);
  const quizzes = selected?.data?.quizzes || [];
  const assignments = selected?.data?.assignments || [];
  const feedback = selected?.data?.feedback || [];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress sx={{ color: ORANGE }} />
      </Box>
    );
  }

  return (
    <div style={{ background: CARD_BG, borderRadius: 16, maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem', boxShadow: '0 4px 32px 0 rgba(0,0,0,0.18)' }}>
      <h2 style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 24, marginBottom: 8, textAlign: 'center' }}>
        Archives &amp; Rounds
      </h2>
      <p style={{ color: GRAY, fontSize: 14, marginBottom: 8, textAlign: 'center' }}>
        Active round: <span style={{ color: ORANGE, fontWeight: 700 }}>{activeRound?.name || '—'}</span>
      </p>
      <p style={{ color: GRAY, fontSize: 13, marginBottom: 20, textAlign: 'center' }}>
        Archive freezes the current round for admin review, then starts a clean slate (admins kept; students &amp; curriculum wiped).
      </p>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {actionMsg && <Alert severity="success" sx={{ mb: 2 }}>{actionMsg}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Button
          variant="contained"
          onClick={() => setConfirmOpen(true)}
          sx={{ background: ORANGE, color: DARK_BG, fontWeight: 700, textTransform: 'none', ':hover': { background: '#ff9900' } }}
        >
          Archive current round &amp; start fresh
        </Button>
      </Box>

      {archives.length === 0 ? (
        <Typography sx={{ color: GRAY, textAlign: 'center' }}>No archives yet.</Typography>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,175,27,0.08)' }}>
              <th style={{ color: HEADER_COLOR, textAlign: 'left', padding: '10px 14px' }}>Round</th>
              <th style={{ color: HEADER_COLOR, textAlign: 'left', padding: '10px 14px' }}>Archived</th>
              <th style={{ color: HEADER_COLOR, textAlign: 'left', padding: '10px 14px' }}>Summary</th>
              <th style={{ color: HEADER_COLOR, textAlign: 'left', padding: '10px 14px' }} />
            </tr>
          </thead>
          <tbody>
            {archives.map((a, idx) => (
              <tr key={a._id} style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(255,175,27,0.03)', borderBottom: '1px solid #31344b' }}>
                <td style={{ color: TEXT_COLOR, padding: '12px 14px', fontWeight: 600 }}>{a.name}</td>
                <td style={{ color: GRAY, padding: '12px 14px' }}>
                  {a.archivedAt ? new Date(a.archivedAt).toLocaleString() : '—'}
                </td>
                <td style={{ color: GRAY, padding: '12px 14px', fontSize: 13 }}>
                  {a.summary?.studentCount ?? 0} students · {a.summary?.lessonCount ?? 0} lessons · {a.summary?.quizCount ?? 0} tests · {a.summary?.assignmentCount ?? 0} assignments · {a.summary?.feedbackCount ?? 0} feedback
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <Button size="small" onClick={() => openArchive(a._id)} sx={{ color: ORANGE, textTransform: 'none', fontWeight: 600 }}>
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Dialog open={confirmOpen} onClose={() => !busy && setConfirmOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { background: CARD_BG, color: TEXT_COLOR, borderRadius: 3 } }}>
        <DialogTitle sx={{ color: HEADER_COLOR, fontWeight: 700 }}>Archive &amp; start fresh?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: GRAY, mb: 2 }}>
            This will freeze today’s live data, then wipe students + curriculum for a new round. Admin accounts stay.
          </Typography>
          <TextField
            fullWidth
            label="Archive name"
            value={archiveName}
            onChange={(e) => setArchiveName(e.target.value)}
            sx={{ mb: 2, input: { color: TEXT_COLOR }, label: { color: ORANGE }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' } }}
            InputLabelProps={{ style: { color: ORANGE } }}
          />
          <TextField
            fullWidth
            label="New round name"
            value={newRoundName}
            onChange={(e) => setNewRoundName(e.target.value)}
            sx={{ mb: 2, input: { color: TEXT_COLOR }, label: { color: ORANGE }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' } }}
            InputLabelProps={{ style: { color: ORANGE } }}
          />
          <ul style={{ color: GRAY, margin: 0, paddingLeft: 20 }}>
            <li>Snapshot students, scores, lessons, tests, assignments, feedback</li>
            <li>Delete student accounts</li>
            <li>Delete live lessons, tests, assignments, feedback</li>
            <li>Keep admins (scores cleared)</li>
          </ul>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} disabled={busy} sx={{ color: GRAY, textTransform: 'none' }}>Cancel</Button>
          <Button
            onClick={runArchiveAndReset}
            disabled={busy}
            variant="contained"
            sx={{ background: ORANGE, color: DARK_BG, fontWeight: 700, textTransform: 'none' }}
          >
            {busy ? 'Working…' : 'Archive & reset'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!selected || detailLoading}
        onClose={() => setSelected(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { background: CARD_BG, color: TEXT_COLOR, borderRadius: 3, maxHeight: '90vh' } }}
      >
        <DialogTitle sx={{ color: HEADER_COLOR, fontWeight: 700, background: 'rgba(255,175,27,0.08)' }}>
          {detailLoading ? 'Loading…' : selected?.name}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: '#31344b' }}>
          {detailLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: ORANGE }} />
            </Box>
          )}
          {selected && !detailLoading && (
            <Box>
              <Typography sx={{ color: GRAY, fontSize: 13, mb: 2 }}>
                Archived {selected.archivedAt ? new Date(selected.archivedAt).toLocaleString() : '—'}
                {selected.note ? ` · ${selected.note}` : ''}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {['leaderboard', 'users', 'tests', 'assignments', 'feedback', 'lessons'].map((t) => (
                  <Button
                    key={t}
                    size="small"
                    variant={tab === t ? 'contained' : 'outlined'}
                    onClick={() => setTab(t)}
                    sx={{
                      textTransform: 'capitalize',
                      fontWeight: 600,
                      bgcolor: tab === t ? ORANGE : 'transparent',
                      color: tab === t ? DARK_BG : ORANGE,
                      borderColor: ORANGE,
                    }}
                  >
                    {t}
                  </Button>
                ))}
              </Box>

              {tab === 'leaderboard' && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,175,27,0.08)' }}>
                      <th style={{ color: ORANGE, padding: 8, textAlign: 'center' }}>#</th>
                      <th style={{ color: ORANGE, padding: 8, textAlign: 'left' }}>Name</th>
                      <th style={{ color: ORANGE, padding: 8, textAlign: 'right' }}>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...students].sort((a, b) => (b.score || 0) - (a.score || 0)).map((u, i) => (
                      <tr key={u._id} style={{ borderBottom: '1px solid #31344b' }}>
                        <td style={{ padding: 8, textAlign: 'center', color: ORANGE, fontWeight: 700 }}>{i + 1}</td>
                        <td style={{ padding: 8 }}>{u.displayName}</td>
                        <td style={{ padding: 8, textAlign: 'right', fontWeight: 700 }}>{u.score ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === 'users' && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', color: GRAY, padding: 6 }}>Name</th>
                      <th style={{ textAlign: 'left', color: GRAY, padding: 6 }}>Username</th>
                      <th style={{ textAlign: 'left', color: GRAY, padding: 6 }}>Score</th>
                      <th style={{ textAlign: 'left', color: GRAY, padding: 6 }}>Tests</th>
                      <th style={{ textAlign: 'left', color: GRAY, padding: 6 }}>Assignments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((u) => (
                      <tr key={u._id} style={{ borderBottom: '1px solid #31344b' }}>
                        <td style={{ padding: 6 }}>{u.displayName}</td>
                        <td style={{ padding: 6, color: GRAY }}>{u.username}</td>
                        <td style={{ padding: 6 }}>{u.score ?? 0}</td>
                        <td style={{ padding: 6 }}>{u.completedTests?.length || 0}</td>
                        <td style={{ padding: 6 }}>{u.completedAssignments?.length || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === 'tests' && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', color: GRAY, padding: 6 }}>Student</th>
                        {quizzes.map((q) => (
                          <th key={q._id} style={{ textAlign: 'center', color: GRAY, padding: 6, minWidth: 90 }}>
                            {q.lessonId?.title || 'Test'}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s) => {
                        const done = {};
                        (s.completedTests || []).forEach((ct) => {
                          done[String(ct.testId)] = ct;
                        });
                        return (
                          <tr key={s._id} style={{ borderBottom: '1px solid #31344b' }}>
                            <td style={{ padding: 6, fontWeight: 600 }}>{s.displayName}</td>
                            {quizzes.map((q) => {
                              const ct = done[String(q._id)];
                              return (
                                <td key={q._id} style={{ padding: 6, textAlign: 'center' }}>
                                  {ct ? <span style={{ color: GREEN }}>✓ ({ct.score})</span> : <span style={{ color: RED }}>✗</span>}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {quizzes.length === 0 && <Typography sx={{ color: GRAY }}>No tests in this archive.</Typography>}
                </div>
              )}

              {tab === 'assignments' && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', color: GRAY, padding: 6 }}>Student</th>
                        {assignments.map((a) => (
                          <th key={a._id} style={{ textAlign: 'center', color: GRAY, padding: 6, minWidth: 100 }}>{a.title}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s) => {
                        const done = {};
                        (s.completedAssignments || []).forEach((ca) => {
                          done[String(ca.assignmentId)] = ca;
                        });
                        return (
                          <tr key={s._id} style={{ borderBottom: '1px solid #31344b' }}>
                            <td style={{ padding: 6, fontWeight: 600 }}>{s.displayName}</td>
                            {assignments.map((a) => {
                              const ca = done[String(a._id)];
                              return (
                                <td key={a._id} style={{ padding: 6, textAlign: 'center' }}>
                                  {ca
                                    ? (ca.graded
                                      ? <span style={{ color: GREEN }}>✓ ({ca.grade})</span>
                                      : <span style={{ color: '#ffd54f' }}>✓</span>)
                                    : <span style={{ color: RED }}>✗</span>}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {assignments.length === 0 && <Typography sx={{ color: GRAY }}>No assignments in this archive.</Typography>}
                </div>
              )}

              {tab === 'feedback' && (
                feedback.length === 0
                  ? <Typography sx={{ color: GRAY }}>No feedback in this archive.</Typography>
                  : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', color: GRAY, padding: 6 }}>Name</th>
                          <th style={{ textAlign: 'center', color: GRAY, padding: 6 }}>Content</th>
                          <th style={{ textAlign: 'center', color: GRAY, padding: 6 }}>Instructor</th>
                          <th style={{ textAlign: 'left', color: GRAY, padding: 6 }}>Activity</th>
                          <th style={{ textAlign: 'left', color: GRAY, padding: 6 }}>Skill</th>
                          <th style={{ textAlign: 'left', color: GRAY, padding: 6 }}>Recommend</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feedback.map((f) => (
                          <tr key={f._id} style={{ borderBottom: '1px solid #31344b' }}>
                            <td style={{ padding: 6 }}>{f.displayName || f.username || '—'}</td>
                            <td style={{ padding: 6, textAlign: 'center' }}>{'⭐'.repeat(f.courseContentRating || 0)}</td>
                            <td style={{ padding: 6, textAlign: 'center' }}>{'⭐'.repeat(f.instructorRating || 0)}</td>
                            <td style={{ padding: 6 }}>{f.favoriteActivity}</td>
                            <td style={{ padding: 6 }}>{f.mostImportantSkill}</td>
                            <td style={{ padding: 6 }}>{f.recommendToFriend || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
              )}

              {tab === 'lessons' && (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {(selected.data?.lessons || []).map((l) => (
                    <li key={l._id} style={{ marginBottom: 6 }}>{l.title}</li>
                  ))}
                  {(selected.data?.lessons || []).length === 0 && (
                    <Typography sx={{ color: GRAY }}>No lessons in this archive.</Typography>
                  )}
                </ul>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)} sx={{ color: ORANGE, textTransform: 'none', fontWeight: 600 }}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
