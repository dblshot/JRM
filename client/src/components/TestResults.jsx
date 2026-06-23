import React from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CelebrationIcon from '@mui/icons-material/Celebration';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

const ORANGE = '#ffaf1b';
const DARK_BG = '#181a20';
const CARD_BG = '#23263a';
const TEXT_COLOR = 'white';
const GRAY = '#b0b3c6';

export default function TestResults({ result, test, onBack }) {
  const [showPreview, setShowPreview] = React.useState(false);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'hard': return '#f44336';
      default: return ORANGE;
    }
  };

  if (!result || !result.feedback || !Array.isArray(result.feedback) || !test || !test.questions || !Array.isArray(test.questions)) {
    return (
      <Box sx={{ minHeight: '100vh', width: '100%', background: DARK_BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{
          background: CARD_BG,
          borderRadius: 6,
          border: `1.5px solid ${ORANGE}`,
          p: 5,
          minWidth: 340,
          maxWidth: 400,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: ORANGE, mb: 2 }} />
          <Typography variant="h4" sx={{ color: ORANGE, fontWeight: 'bold', mb: 1 }}>
            You already finished this test!
          </Typography>
          {result && typeof result.score === 'number' && (
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 3 }}>
              Your Score: {result.score}
            </Typography>
          )}
          <Button
            onClick={() => setShowPreview(true)}
            sx={{
              color: 'white',
              background: '#23263a',
              fontWeight: 600,
              borderRadius: 2,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              border: `2px solid ${ORANGE}`,
              ':hover': { background: DARK_BG, borderColor: ORANGE },
              mb: 2
            }}
            variant="outlined"
          >
            Preview your answers
          </Button>
          <Button
            onClick={onBack}
            sx={{
              color: 'black',
              background: ORANGE,
              fontWeight: 600,
              borderRadius: 2,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              ':hover': { background: '#ff9900' },
              mt: 0
            }}
            variant="contained"
          >
            Back to Home page
          </Button>
          {/* Preview Modal */}
          <Dialog open={showPreview} onClose={() => setShowPreview(false)} maxWidth="md" fullWidth>
            <DialogTitle sx={{ background: CARD_BG, color: ORANGE, fontWeight: 700, fontSize: 24, textAlign: 'center' }}>
              Test Results Preview
            </DialogTitle>
            <DialogContent sx={{ background: CARD_BG, color: TEXT_COLOR, p: 0 }}>
              {/* Reuse the main results UI for preview */}
              <Box sx={{ p: 3 }}>
                {/* Score and Time Bonus */}
                <Typography variant="h4" sx={{ color: ORANGE, fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                  Your Score: {result.score}
                </Typography>
                {typeof result.timeBonusApplied === 'boolean' && (
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mb: 3,
                    mt: -1
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      {result.timeBonusApplied ? (
                        <CelebrationIcon sx={{ color: '#4caf50', fontSize: 36 }} />
                      ) : (
                        <CancelIcon sx={{ color: '#f44336', fontSize: 36 }} />
                      )}
                      <Typography variant="h6" sx={{
                        color: result.timeBonusApplied ? '#4caf50' : '#f44336',
                        fontWeight: 'bold',
                        letterSpacing: 1
                      }}>
                        {result.timeBonusApplied ? 'Time Bonus Earned!' : 'No Time Bonus'}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: TEXT_COLOR, mb: 1 }}>
                      {result.timeBonusApplied
                        ? 'You finished within the bonus window and earned extra points!'
                        : 'You finished after the bonus window. Try to be quicker next time!'}
                    </Typography>
                    {typeof result.timeTaken === 'number' && (
                      <Typography variant="body2" sx={{ color: GRAY }}>
                        Time Taken: {Math.floor(result.timeTaken / 60)}:{(result.timeTaken % 60).toString().padStart(2, '0')} &nbsp;|&nbsp; Bonus Limit: {Math.floor((test.timeLimit || 120) / 60)}:{((test.timeLimit || 120) % 60).toString().padStart(2, '0')}
                      </Typography>
                    )}
                  </Box>
                )}
                {/* Feedback Section */}
                {result.feedback && Array.isArray(result.feedback) && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ color: ORANGE, fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                      Question Feedback
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {result.feedback.map((fb, index) => (
                        <Box 
                          key={index}
                          sx={{ 
                            background: DARK_BG, 
                            borderRadius: 8, 
                            p: 2,
                            border: `2px solid ${fb.isCorrect ? '#4caf50' : '#f44336'}`
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ color: TEXT_COLOR, fontWeight: 'bold' }}>
                              Question {fb.questionIndex + 1}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              {fb.isCorrect ? (
                                <CheckCircleIcon sx={{ color: '#4caf50' }} />
                              ) : (
                                <CancelIcon sx={{ color: '#f44336' }} />
                              )}
                              <Chip 
                                label={test.questions[fb.questionIndex].difficulty}
                                size="small"
                                sx={{ 
                                  background: getDifficultyColor(test.questions[fb.questionIndex].difficulty),
                                  color: 'white',
                                  fontWeight: 600
                                }}
                              />
                              <Typography variant="body2" sx={{ color: fb.isCorrect ? '#4caf50' : '#f44336', fontWeight: 'bold' }}>
                                {fb.pointsEarned} pts
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="body2" sx={{ color: TEXT_COLOR, mb: 1 }}>{fb.text}</Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {fb.choices.map((choice, choiceIndex) => {
                              const isSelected = choiceIndex === fb.selectedAnswer;
                              const isCorrect = fb.isCorrect && isSelected;
                              const isCorrectAnswer = choiceIndex === fb.correctAnswer && !fb.isCorrect;
                              return (
                                <Box 
                                  key={choiceIndex}
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '6px 10px',
                                    borderRadius: 4,
                                    background: isSelected ? 
                                      (fb.isCorrect ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.1)') : 
                                      'rgba(255,255,255,0.05)',
                                    border: isSelected ? 
                                      `1px solid ${fb.isCorrect ? '#4caf50' : '#f44336'}` : 
                                      '1px solid transparent',
                                    minHeight: 36
                                  }}
                                >
                                  <Typography variant="body2" sx={{ 
                                    color: isSelected ? 
                                      (fb.isCorrect ? '#4caf50' : '#f44336') : ORANGE,
                                    fontWeight: 600,
                                    marginRight: 10,
                                    minWidth: 28,
                                    textAlign: 'center',
                                    display: 'inline-block'
                                  }}>
                                    {String.fromCharCode(65 + choiceIndex)}.
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: TEXT_COLOR, flex: 1 }}>
                                    {choice}
                                  </Typography>
                                  {/* Fixed-width chip container for alignment */}
                                  <Box sx={{ minWidth: 100, display: 'flex', gap: 1 }}>
                                    {isSelected ? (
                                      <Chip 
                                        label={fb.isCorrect ? "Your Answer ✓" : "Your Answer ✗"}
                                        size="small"
                                        sx={{ 
                                          background: fb.isCorrect ? '#4caf50' : '#f44336',
                                          color: 'white',
                                          fontWeight: 600,
                                          ml: 1
                                        }}
                                      />
                                    ) : (
                                      <span style={{ width: 0, height: 0, display: 'inline-block' }} />
                                    )}
                                    {isCorrectAnswer ? (
                                      <Chip 
                                        label="Correct Answer"
                                        size="small"
                                        sx={{ 
                                          background: '#4caf50',
                                          color: 'white',
                                          fontWeight: 600,
                                          ml: 1
                                        }}
                                      />
                                    ) : (
                                      <span style={{ width: 0, height: 0, display: 'inline-block' }} />
                                    )}
                                  </Box>
                                </Box>
                              );
                            })}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ background: CARD_BG, justifyContent: 'center', p: 2 }}>
              <Button onClick={() => setShowPreview(false)} sx={{ color: ORANGE, borderColor: ORANGE, fontWeight: 600, borderRadius: 2, px: 4, py: 1.5, textTransform: 'none' }} variant="outlined">
                Close Preview
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        width: '100%',
        background: `linear-gradient(135deg, ${DARK_BG} 0%, #23263a 100%)`,
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflowY: 'auto'
      }}
    >
      <Box 
        sx={{ 
          background: CARD_BG, 
          borderRadius: 16, 
          width: '100%',
          maxWidth: 1200,
          padding: '2rem 1.5rem', 
          border: `2px solid ${ORANGE}`,
          textAlign: 'center'
        }}
      >
        <Typography variant="h3" sx={{ color: ORANGE, fontWeight: 'bold', mb: 2 }}>
          Test Complete!
        </Typography>
        <Typography variant="h4" sx={{ color: ORANGE, fontWeight: 'bold', mb: 3 }}>
          Your Score: {result.score}
        </Typography>
        {/* Time Bonus Indicator */}
        {typeof result.timeBonusApplied === 'boolean' && (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4,
            mt: -1
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              {result.timeBonusApplied ? (
                <CelebrationIcon sx={{ color: '#4caf50', fontSize: 40 }} />
              ) : (
                <CancelIcon sx={{ color: '#f44336', fontSize: 40 }} />
              )}
              <Typography variant="h5" sx={{
                color: result.timeBonusApplied ? '#4caf50' : '#f44336',
                fontWeight: 'bold',
                letterSpacing: 1
              }}>
                {result.timeBonusApplied ? 'Time Bonus Earned!' : 'No Time Bonus'}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ color: TEXT_COLOR, mb: 1 }}>
              {result.timeBonusApplied
                ? 'You finished within the bonus window and earned extra points!'
                : 'You finished after the bonus window. Try to be quicker next time!'}
            </Typography>
            {typeof result.timeTaken === 'number' && (
              <Typography variant="body2" sx={{ color: GRAY }}>
                Time Taken: {Math.floor(result.timeTaken / 60)}:{(result.timeTaken % 60).toString().padStart(2, '0')} &nbsp;|&nbsp; Bonus Limit: {Math.floor((test.timeLimit || 120) / 60)}:{((test.timeLimit || 120) % 60).toString().padStart(2, '0')}
              </Typography>
            )}
          </Box>
        )}
        {/* Show feedback only if available */}
        {result.feedback && Array.isArray(result.feedback) ? (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ color: ORANGE, fontWeight: 'bold', mb: 3 }}>
              Question Feedback
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {result.feedback.map((fb, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    background: DARK_BG, 
                    borderRadius: 8, 
                    p: 3,
                    border: `2px solid ${fb.isCorrect ? '#4caf50' : '#f44336'}`
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: TEXT_COLOR, fontWeight: 'bold' }}>
                      Question {fb.questionIndex + 1}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {fb.isCorrect ? (
                        <CheckCircleIcon sx={{ color: '#4caf50' }} />
                      ) : (
                        <CancelIcon sx={{ color: '#f44336' }} />
                      )}
                      <Chip 
                        label={test.questions[fb.questionIndex].difficulty}
                        size="small"
                        sx={{ 
                          background: getDifficultyColor(test.questions[fb.questionIndex].difficulty),
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                      <Typography variant="body2" sx={{ color: fb.isCorrect ? '#4caf50' : '#f44336', fontWeight: 'bold' }}>
                        {fb.pointsEarned} pts
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1" sx={{ color: TEXT_COLOR, mb: 2 }}>{fb.text}</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {fb.choices.map((choice, choiceIndex) => {
                      const isSelected = choiceIndex === fb.selectedAnswer;
                      const isCorrect = fb.isCorrect && isSelected;
                      const isCorrectAnswer = choiceIndex === fb.correctAnswer && !fb.isCorrect;
                      return (
                        <Box 
                          key={choiceIndex}
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '8px 12px',
                            borderRadius: 4,
                            background: isSelected ? 
                              (fb.isCorrect ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.1)') : 
                              'rgba(255,255,255,0.05)',
                            border: isSelected ? 
                              `1px solid ${fb.isCorrect ? '#4caf50' : '#f44336'}` : 
                              '1px solid transparent',
                            minHeight: 40
                          }}
                        >
                          <Typography variant="body2" sx={{ 
                            color: isSelected ? 
                              (fb.isCorrect ? '#4caf50' : '#f44336') : ORANGE,
                            fontWeight: 600,
                            marginRight: 12,
                            minWidth: 28,
                            textAlign: 'center',
                            display: 'inline-block'
                          }}>
                            {String.fromCharCode(65 + choiceIndex)}.
                          </Typography>
                          <Typography variant="body2" sx={{ color: TEXT_COLOR, flex: 1 }}>
                            {choice}
                          </Typography>
                          {/* Fixed-width chip container for alignment */}
                          <Box sx={{ minWidth: 120, display: 'flex', gap: 1 }}>
                            {isSelected ? (
                              <Chip 
                                label={fb.isCorrect ? "Your Answer ✓" : "Your Answer ✗"}
                                size="small"
                                sx={{ 
                                  background: fb.isCorrect ? '#4caf50' : '#f44336',
                                  color: 'white',
                                  fontWeight: 600,
                                  ml: 1
                                }}
                              />
                            ) : (
                              <span style={{ width: 0, height: 0, display: 'inline-block' }} />
                            )}
                            {isCorrectAnswer ? (
                              <Chip 
                                label="Correct Answer"
                                size="small"
                                sx={{ 
                                  background: '#4caf50',
                                  color: 'white',
                                  fontWeight: 600,
                                  ml: 1
                                }}
                              />
                            ) : (
                              <span style={{ width: 0, height: 0, display: 'inline-block' }} />
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        ) : (
          <Typography variant="body1" sx={{ color: TEXT_COLOR, mb: 4 }}>
            You have already completed this test. Only your total score is shown here.
          </Typography>
        )}
        <Button
          onClick={onBack}
          sx={{
            color: 'white',
            background: ORANGE,
            fontWeight: 600,
            borderRadius: 2,
            px: 4,
            py: 1.5,
            textTransform: 'none',
            ':hover': { background: '#ff9900' },
          }}
          variant="contained"
        >
          Back to Lessons
        </Button>
      </Box>
    </Box>
  );
}
