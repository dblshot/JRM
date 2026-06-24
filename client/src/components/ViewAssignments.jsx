import React, { useState } from 'react';
import { IconButton, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import useAllAssignments from '../hooks/useAllAssignments';
import EditAssignmentForm from './EditAssignmentForm';
import useAssignmentSubmissions from '../hooks/useAssignmentSubmissions';

const ORANGE = '#ffaf1b';
const DARK_BG = '#181a20';
const CARD_BG = '#23263a';
const TEXT_COLOR = 'white';
const HEADER_COLOR = ORANGE;

function SubmissionsDialog({ open, onClose, assignment }) {
  const { submissions, loading, error } = useAssignmentSubmissions(assignment?._id);
  const [grading, setGrading] = useState({});
  const [gradeError, setGradeError] = useState(null);
  const [submitting, setSubmitting] = useState(null);
  const [localSubs, setLocalSubs] = useState([]);

  React.useEffect(() => {
    setLocalSubs(submissions);
  }, [submissions]);

  const handleGrade = async (userId, grade) => {
    setSubmitting(userId);
    setGradeError(null);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${API_BASE}/assignments/${assignment._id}/grade/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade: Number(grade) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to grade');
      // Update local state
      setLocalSubs(s => s.map(sub => sub.userId === userId ? { ...sub, graded: true, grade: Number(grade) } : sub));
      setGrading(g => ({ ...g, [userId]: '' }));
    } catch (err) {
      setGradeError(err.message);
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { background: CARD_BG, color: TEXT_COLOR, borderRadius: 3 } }}>
      <DialogTitle sx={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 22, textAlign: 'center', background: 'rgba(255,175,27,0.08)', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
        Assignment Submissions
      </DialogTitle>
      <DialogContent>
        {loading && <CircularProgress sx={{ color: ORANGE }} />}
        {error && <Alert severity="error">{error}</Alert>}
        {gradeError && <Alert severity="error">{gradeError}</Alert>}
        {!loading && !error && localSubs.length === 0 && <div style={{ color: TEXT_COLOR }}>No submissions yet.</div>}
        {!loading && !error && localSubs.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', color: TEXT_COLOR }}>
            <thead>
              <tr style={{ background: 'rgba(255,175,27,0.08)' }}>
                <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 16, padding: '10px 8px' }}>User</th>
                <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 16, padding: '10px 8px' }}>Submitted At</th>
                <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 16, padding: '10px 8px' }}>File</th>
                <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 16, padding: '10px 8px' }}>Grade</th>
                <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 16, padding: '10px 8px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {localSubs.map(sub => (
                <tr key={sub.userId} style={{ borderBottom: '1px solid #31344b' }}>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>{sub.displayName || sub.username}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>{sub.uploadedAt ? new Date(sub.uploadedAt).toLocaleString() : '-'}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>{sub.fileUrl ? <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: ORANGE }}>View File</a> : '-'}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>{sub.graded ? sub.grade : 'Not graded'}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    {sub.graded ? (
                      <span style={{ color: ORANGE }}>Graded</span>
                    ) : (
                      <span>
                        <input
                          type="number"
                          min={0}
                          style={{ width: 60, marginRight: 8, background: '#23263a', color: 'white', border: '1px solid #444', borderRadius: 4, padding: '2px 6px' }}
                          value={grading[sub.userId] || ''}
                          onChange={e => setGrading(g => ({ ...g, [sub.userId]: e.target.value }))}
                          disabled={submitting === sub.userId}
                        />
                        <Button
                          variant="contained"
                          size="small"
                          sx={{ bgcolor: ORANGE, color: DARK_BG, fontWeight: 600, borderRadius: 2, px: 2, textTransform: 'none', ':hover': { bgcolor: '#ff9900' } }}
                          onClick={() => handleGrade(sub.userId, grading[sub.userId])}
                          disabled={submitting === sub.userId || !grading[sub.userId]}
                        >
                          {submitting === sub.userId ? <CircularProgress size={18} sx={{ color: DARK_BG }} /> : 'Grade'}
                        </Button>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: ORANGE, fontWeight: 600, borderRadius: 2, px: 3, textTransform: 'none' }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ViewAssignments() {
  const { assignments, loading, error, refetch } = useAllAssignments();
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [confirmDeleteAssignment, setConfirmDeleteAssignment] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [viewSubsAssignment, setViewSubsAssignment] = useState(null);

  const handleDelete = async (assignment) => {
    setDeleteLoading(assignment._id);
    setDeleteError(null);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${API_BASE}/assignments/${encodeURIComponent(assignment._id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete assignment');
      refetch();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(null);
      setConfirmDeleteAssignment(null);
    }
  };

  const handleUpdate = () => {
    refetch();
  };

  return (
    <div style={{ background: CARD_BG, borderRadius: 16, maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem', boxShadow: '0 4px 32px 0 rgba(0,0,0,0.18)' }}>
      <h2 style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 24, marginBottom: 24, textAlign: 'center' }}>All Assignments</h2>
      {loading && <div style={{ color: TEXT_COLOR, textAlign: 'center' }}>Loading...</div>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
      {!loading && !error && (
        <table style={{ width: '100%', borderCollapse: 'collapse', color: TEXT_COLOR }}>
          <thead>
            <tr style={{ background: 'rgba(255,175,27,0.08)' }}>
              <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 16, padding: '10px 16px', textAlign: 'center' }}>Title</th>
              <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 16, padding: '10px 16px', textAlign: 'center' }}>Due Date</th>
              <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 16, padding: '10px 16px', textAlign: 'center' }}>Points</th>
              <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 16, padding: '10px 16px', textAlign: 'center' }}>Lesson</th>
              <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 16, padding: '10px 16px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment, idx) => (
              <tr key={assignment._id} style={{ borderBottom: '1px solid #31344b', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,175,27,0.03)' }}>
                <td style={{ padding: '14px 16px', fontWeight: 500, textAlign: 'center' }}>{assignment.title}</td>
                <td style={{ padding: '14px 16px', fontWeight: 500, textAlign: 'center' }}>{assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : '-'}</td>
                <td style={{ padding: '14px 16px', fontWeight: 500, textAlign: 'center' }}>{assignment.points}</td>
                <td style={{ padding: '14px 16px', fontWeight: 500, textAlign: 'center' }}>{assignment.lessonId?.title || '-'}</td>
                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                  <IconButton
                    aria-label="edit"
                    onClick={() => setEditingAssignment(assignment)}
                    sx={{ color: ORANGE, mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    aria-label="delete"
                    onClick={() => setConfirmDeleteAssignment(assignment)}
                    sx={{ color: ORANGE }}
                    disabled={deleteLoading === assignment._id}
                  >
                    {deleteLoading === assignment._id ? <CircularProgress size={22} sx={{ color: ORANGE }} /> : <DeleteIcon />}
                  </IconButton>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ color: ORANGE, borderColor: ORANGE, fontWeight: 600, borderRadius: 2, ml: 1, textTransform: 'none' }}
                    onClick={() => setViewSubsAssignment(assignment)}
                  >
                    View Submissions
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!confirmDeleteAssignment}
        onClose={() => setConfirmDeleteAssignment(null)}
        PaperProps={{
          sx: {
            background: CARD_BG,
            color: TEXT_COLOR,
            borderRadius: 3,
            minWidth: 340,
          },
        }}
      >
        <DialogTitle sx={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 22, textAlign: 'center', background: 'rgba(255,175,27,0.08)', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: TEXT_COLOR, fontSize: 17, textAlign: 'center' }}>
            Are you sure you want to delete the assignment "{confirmDeleteAssignment?.title}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={() => setConfirmDeleteAssignment(null)}
            sx={{
              color: ORANGE,
              borderColor: ORANGE,
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              background: 'transparent',
              ':hover': { background: 'rgba(255,175,27,0.08)', borderColor: ORANGE },
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDelete(confirmDeleteAssignment)}
            sx={{
              color: 'white',
              background: ORANGE,
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              ':hover': { background: '#ff9900' },
            }}
            variant="contained"
            disabled={deleteLoading === confirmDeleteAssignment?._id}
          >
            {deleteLoading === confirmDeleteAssignment?._id ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Assignment Dialog */}
      <Dialog
        open={!!editingAssignment}
        onClose={() => setEditingAssignment(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: CARD_BG,
            color: TEXT_COLOR,
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 22, textAlign: 'center', background: 'rgba(255,175,27,0.08)', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
          Edit Assignment
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {editingAssignment && (
            <EditAssignmentForm assignment={editingAssignment} onUpdate={handleUpdate} onClose={() => setEditingAssignment(null)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Submissions Dialog */}
      <SubmissionsDialog open={!!viewSubsAssignment} onClose={() => setViewSubsAssignment(null)} assignment={viewSubsAssignment} />
    </div>
  );
}
