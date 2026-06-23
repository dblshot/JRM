import React, { useState } from 'react';
import { IconButton, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import QuizIcon from '@mui/icons-material/Quiz';
import EditLessonForm from './EditLessonForm';
import useAllLessons from '../hooks/useAllLessons';
import useAllTests from '../hooks/useAllTests';

const ORANGE = '#ffaf1b';
const CARD_BG = '#23263a';
const TEXT_COLOR = 'white';
const HEADER_COLOR = ORANGE;

export default function ViewLessons() {
  const { lessons, loading, error, refetch } = useAllLessons();
  const { tests } = useAllTests();
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [confirmDeleteLesson, setConfirmDeleteLesson] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [viewingTest, setViewingTest] = useState(null);

  const handleDelete = async (lesson) => {
    setDeleteLoading(lesson._id);
    setDeleteError(null);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${API_BASE}/lessons/${encodeURIComponent(lesson._id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete lesson');
      refetch();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(null);
      setConfirmDeleteLesson(null);
    }
  };

  const handleUpdate = (updatedLesson) => {
    refetch();
  };

  // Helper function to get test for a lesson
  const getTestForLesson = (lessonId) => {
    return tests.find(test => test.lessonId?._id === lessonId || test.lessonId === lessonId);
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
    <div style={{ background: CARD_BG, borderRadius: 16, maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem', boxShadow: '0 4px 32px 0 rgba(0,0,0,0.18)' }}>
      <h2 style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 24, marginBottom: 24, textAlign: 'center' }}>All Lessons</h2>
      {loading && <div style={{ color: TEXT_COLOR, textAlign: 'center' }}>Loading...</div>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
      {!loading && !error && (
        <table style={{ width: '100%', borderCollapse: 'collapse', color: TEXT_COLOR }}>
          <thead>
            <tr style={{ background: 'rgba(255,175,27,0.08)' }}>
              <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 16, padding: '10px 16px', textAlign: 'center' }}>Title</th>
              <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 16, padding: '10px 16px', textAlign: 'center' }}>Video Link</th>
              <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 16, padding: '10px 16px', textAlign: 'center' }}>Slides Link</th>
              <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 16, padding: '10px 16px', textAlign: 'center' }}>Test</th>
              <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 16, padding: '10px 16px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((lesson, idx) => {
              const lessonTest = getTestForLesson(lesson._id);
              return (
                <tr key={lesson._id} style={{ borderBottom: '1px solid #31344b', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,175,27,0.03)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 500, textAlign: 'center' }}>{lesson.title}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 500, textAlign: 'center' }}>
                    {lesson.videoLink ? <a href={lesson.videoLink} target="_blank" rel="noopener noreferrer" style={{ color: ORANGE }}>Video</a> : '—'}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 500, textAlign: 'center' }}>
                    {lesson.slidesLink ? <a href={lesson.slidesLink} target="_blank" rel="noopener noreferrer" style={{ color: ORANGE }}>Slides</a> : '—'}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    {lessonTest ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <Chip 
                          label={`${lessonTest.questions?.length || 0} Q`}
                          size="small"
                          sx={{ 
                            background: 'rgba(76,175,80,0.1)', 
                            color: '#4caf50', 
                            fontWeight: 600 
                          }}
                        />
                        <IconButton
                          aria-label="view test"
                          onClick={() => setViewingTest(lessonTest)}
                          sx={{ color: ORANGE, padding: 2 }}
                        >
                          <QuizIcon fontSize="small" />
                        </IconButton>
                      </div>
                    ) : (
                      <span style={{ color: '#666' }}>No test</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <IconButton
                      aria-label="edit"
                      onClick={() => setEditingLesson(lesson)}
                      sx={{ color: ORANGE, mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      aria-label="delete"
                      onClick={() => setConfirmDeleteLesson(lesson)}
                      sx={{ color: ORANGE }}
                      disabled={deleteLoading === lesson._id}
                    >
                      {deleteLoading === lesson._id ? <CircularProgress size={22} sx={{ color: ORANGE }} /> : <DeleteIcon />}
                    </IconButton>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <Dialog
        open={!!confirmDeleteLesson}
        onClose={() => setConfirmDeleteLesson(null)}
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
            Are you sure you want to delete the lesson "{confirmDeleteLesson?.title}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={() => setConfirmDeleteLesson(null)}
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
            onClick={() => handleDelete(confirmDeleteLesson)}
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
            disabled={deleteLoading === confirmDeleteLesson?._id}
          >
            {deleteLoading === confirmDeleteLesson?._id ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={!!editingLesson}
        onClose={() => setEditingLesson(null)}
        PaperProps={{
          sx: {
            background: CARD_BG,
            color: TEXT_COLOR,
            borderRadius: 3,
            minWidth: 500,
          },
        }}
      >
        <DialogContent>
          {editingLesson && (
            <EditLessonForm
              lesson={editingLesson}
              onClose={() => setEditingLesson(null)}
              onUpdate={handleUpdate}
            />
          )}
        </DialogContent>
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
                  background: CARD_BG, 
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
    </div>
  );
}
