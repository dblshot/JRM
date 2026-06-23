import React, { useState } from 'react';
import { IconButton, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import useAllTests from '../hooks/useAllTests';
import EditTestForm from './EditTestForm';

const ORANGE = '#ffaf1b';
const DARK_BG = '#181a20';
const CARD_BG = '#23263a';
const TEXT_COLOR = 'white';
const HEADER_COLOR = ORANGE;

export default function ViewTests() {
  const { tests, loading, error, refetch } = useAllTests();
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [confirmDeleteTest, setConfirmDeleteTest] = useState(null);
  const [viewingTest, setViewingTest] = useState(null);
  const [editingTest, setEditingTest] = useState(null);

  const handleDelete = async (test) => {
    setDeleteLoading(test._id);
    setDeleteError(null);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${API_BASE}/tests/${encodeURIComponent(test._id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete test');
      refetch();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(null);
      setConfirmDeleteTest(null);
    }
  };

  const handleUpdate = (updatedTest) => {
    refetch();
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'hard': return '#f44336';
      default: return ORANGE;
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ background: CARD_BG, borderRadius: 16, maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem', boxShadow: '0 4px 32px 0 rgba(0,0,0,0.18)' }}>
      <h2 style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 24, marginBottom: 24, textAlign: 'center' }}>All Tests</h2>
      {loading && <div style={{ color: TEXT_COLOR, textAlign: 'center' }}>Loading...</div>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
      {!loading && !error && (
        <table style={{ width: '100%', borderCollapse: 'collapse', color: TEXT_COLOR }}>
          <thead>
            <tr style={{ background: 'rgba(255,175,27,0.08)' }}>
              <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 16, padding: '10px 16px', textAlign: 'center' }}>Lesson</th>
              <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 16, padding: '10px 16px', textAlign: 'center' }}>Questions</th>
              <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 16, padding: '10px 16px', textAlign: 'center' }}>Time Limit</th>
              <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 16, padding: '10px 16px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((test, idx) => (
              <tr key={test._id} style={{ borderBottom: '1px solid #31344b', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,175,27,0.03)' }}>
                <td style={{ padding: '14px 16px', fontWeight: 500, textAlign: 'center' }}>
                  {test.lessonId?.title || 'Unknown Lesson'}
                </td>
                <td style={{ padding: '14px 16px', fontWeight: 500, textAlign: 'center' }}>
                  {test.questions?.length || 0} questions
                </td>
                <td style={{ padding: '14px 16px', fontWeight: 500, textAlign: 'center' }}>
                  {formatTime(test.timeLimit || 120)}
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                  <IconButton
                    aria-label="view"
                    onClick={() => setViewingTest(test)}
                    sx={{ color: ORANGE, mr: 1 }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    aria-label="edit"
                    onClick={() => setEditingTest(test)}
                    sx={{ color: ORANGE, mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    aria-label="delete"
                    onClick={() => setConfirmDeleteTest(test)}
                    sx={{ color: ORANGE }}
                    disabled={deleteLoading === test._id}
                  >
                    {deleteLoading === test._id ? <CircularProgress size={22} sx={{ color: ORANGE }} /> : <DeleteIcon />}
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!confirmDeleteTest}
        onClose={() => setConfirmDeleteTest(null)}
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
            Are you sure you want to delete the test for "{confirmDeleteTest?.lessonId?.title}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={() => setConfirmDeleteTest(null)}
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
            onClick={() => handleDelete(confirmDeleteTest)}
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
            disabled={deleteLoading === confirmDeleteTest?._id}
          >
            {deleteLoading === confirmDeleteTest?._id ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Test Dialog */}
      <Dialog
        open={!!viewingTest}
        onClose={() => setViewingTest(null)}
        maxWidth="md"
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
          Test Preview - {viewingTest?.lessonId?.title}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {viewingTest && (
            <div>
              <div style={{ marginBottom: 20, display: 'flex', gap: 16, justifyContent: 'center' }}>
                <Chip 
                  label={`${viewingTest.questions?.length || 0} Questions`}
                  sx={{ 
                    background: 'rgba(255,175,27,0.1)', 
                    color: ORANGE, 
                    fontWeight: 600 
                  }}
                />
                <Chip 
                  label={`Time: ${formatTime(viewingTest.timeLimit || 120)}`}
                  sx={{ 
                    background: 'rgba(255,175,27,0.1)', 
                    color: ORANGE, 
                    fontWeight: 600 
                  }}
                />
              </div>
              
              {viewingTest.questions?.map((question, index) => (
                <div key={index} style={{ 
                  background: DARK_BG, 
                  borderRadius: 12, 
                  padding: 20, 
                  marginBottom: 16,
                  border: '1px solid #31344b'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h4 style={{ color: ORANGE, margin: 0 }}>Question {index + 1}</h4>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Chip 
                        label={question.difficulty}
                        size="small"
                        sx={{ 
                          background: getDifficultyColor(question.difficulty),
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                      <Chip 
                        label={`${question.basePoints} pts`}
                        size="small"
                        sx={{ 
                          background: 'rgba(255,175,27,0.1)', 
                          color: ORANGE, 
                          fontWeight: 600 
                        }}
                      />
                    </div>
                  </div>
                  
                  <p style={{ color: TEXT_COLOR, fontSize: 16, marginBottom: 16, fontWeight: 500 }}>
                    {question.text}
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {question.choices?.map((choice, choiceIndex) => (
                      <div key={choiceIndex} style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        padding: '8px 12px',
                        borderRadius: 6,
                        background: choiceIndex === question.correctAnswer ? 'rgba(76,175,80,0.1)' : 'rgba(255,255,255,0.05)',
                        border: choiceIndex === question.correctAnswer ? '1px solid #4caf50' : '1px solid transparent'
                      }}>
                        <span style={{ 
                          color: choiceIndex === question.correctAnswer ? '#4caf50' : ORANGE,
                          fontWeight: 600,
                          marginRight: 12,
                          minWidth: 20
                        }}>
                          {String.fromCharCode(65 + choiceIndex)}.
                        </span>
                        <span style={{ color: TEXT_COLOR }}>
                          {choice}
                        </span>
                        {choiceIndex === question.correctAnswer && (
                          <Chip 
                            label="Correct"
                            size="small"
                            sx={{ 
                              background: '#4caf50',
                              color: 'white',
                              fontWeight: 600,
                              ml: 'auto'
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={() => setViewingTest(null)}
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
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Test Dialog */}
      <Dialog
        open={!!editingTest}
        onClose={() => setEditingTest(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            background: 'transparent',
            boxShadow: 'none',
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {editingTest && (
            <EditTestForm
              test={editingTest}
              onClose={() => setEditingTest(null)}
              onUpdate={handleUpdate}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
