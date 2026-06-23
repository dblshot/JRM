import React from 'react';
import { Box, Typography, Button, Chip, Alert, IconButton } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TimerIcon from '@mui/icons-material/Timer';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ORANGE = '#ffaf1b';
const DARK_BG = '#181a20';
const CARD_BG = '#23263a';
const TEXT_COLOR = 'white';
const GRAY = '#b0b3c6';

export default function TestInstructions({ test, onStart, onBack, hasCompleted, completedTest }) {
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'hard': return '#f44336';
      default: return ORANGE;
    }
  };

  if (hasCompleted && completedTest) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: DARK_BG,
          padding: '2rem',
          textAlign: 'center'
        }}
      >
        <CheckCircleIcon sx={{ fontSize: 64, color: '#4caf50', mb: 2 }} />
        <Typography variant="h4" sx={{ color: ORANGE, fontWeight: 'bold', mb: 2 }}>
          Test Already Completed
        </Typography>
        
        <Box sx={{ background: CARD_BG, borderRadius: 12, p: 3, mb: 3, maxWidth: 600, mx: 'auto' }}>
          <Typography variant="h6" sx={{ color: TEXT_COLOR, mb: 2 }}>
            Your Previous Result
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 2 }}>
            <Box textAlign="center">
              <Typography variant="h5" sx={{ color: ORANGE, fontWeight: 'bold' }}>
                {completedTest.score} points
              </Typography>
              <Typography variant="body2" sx={{ color: GRAY }}>
                Score
              </Typography>
            </Box>
          </Box>
        </Box>

        <Alert severity="info" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
          You can only take each test once. Your score has been recorded.
        </Alert>

        <Button
          onClick={onBack}
          sx={{
            color: ORANGE,
            borderColor: ORANGE,
            fontWeight: 600,
            borderRadius: 2,
            px: 4,
            py: 1.5,
            textTransform: 'none',
            background: 'transparent',
            ':hover': { background: 'rgba(255,175,27,0.08)', borderColor: ORANGE },
          }}
          variant="outlined"
        >
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: DARK_BG,
        padding: '2rem'
      }}
    >
      {/* Header with Back Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton 
          onClick={onBack}
          sx={{ 
            color: ORANGE,
            '&:hover': { background: 'rgba(255,175,27,0.08)' }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h3" sx={{ color: ORANGE, fontWeight: 'bold', ml: 2 }}>
          Test Instructions
        </Typography>
      </Box>

      {/* Test Info */}
      <Box sx={{ background: CARD_BG, borderRadius: 12, p: 3, mb: 4, maxWidth: 800, mx: 'auto', textAlign: 'center' }}>
        <Typography variant="h5" sx={{ color: TEXT_COLOR, mb: 2, fontSize: '3rem' }}>
          {test?.lessonId?.title || 'Unknown Lesson'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', textAlign: 'center', justifyContent: 'center' }}>
          <Chip 
            icon={<TimerIcon />}
            label={`Time Bonus works for : ${formatTime(test?.timeLimit || 120)} `}
            sx={{ 
              background: 'rgba(255,175,27,0.1)', 
              color: ORANGE, 
              fontWeight: 600 
            }}
          />
          <Chip 
            label={`${test?.questions?.length || 0} Questions`}
            sx={{ 
              background: 'rgba(255,175,27,0.1)', 
              color: ORANGE, 
              fontWeight: 600 
            }}
          />
        </Box>
      </Box>

      {/* Warning */}
      <Box sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
        <Alert 
          severity="warning" 
          sx={{ 
            fontSize: '1.2rem',
            alignItems: 'center',
            '& .MuiAlert-icon': {
              alignItems: 'center'
            },
            '& .MuiAlert-message': {
              fontSize: '1.2rem',
              fontWeight: 600
            }
          }}
        >
          Important: It's better to take this test after watching the lesson video and reading the slides to get the best results!
        </Alert>
      </Box>

      {/* Scoring System */}
      <Box sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h5" sx={{ color: ORANGE, fontWeight: 'bold', mb: 3 }}>
          <EmojiEventsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Scoring System
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ background: CARD_BG, borderRadius: 8, p: 3 }}>
            <Typography variant="h6" sx={{ color: '#2196f3', fontWeight: 'bold', mb: 1 }}>
              ⏱️ Time Bonus
            </Typography>
            <Typography variant="body1" sx={{ color: TEXT_COLOR, mb: 2 }}>
              Complete the test quickly to earn bonus points:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" sx={{ color: '#4caf50', fontSize: '1.2rem' }}>
                • Finish before the Time Bonus limit to get more points
              </Typography>
              <Typography variant="body2" sx={{ color: '#f44336', fontSize: '1.2rem' }}>
                • Finish after the Time Bonus limit to get less points
              </Typography>
            </Box>
          </Box>

          <Box sx={{ background: CARD_BG, borderRadius: 8, p: 3 }}>
            <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 'bold', mb: 1 }}>
              📝 Test Rules
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" sx={{ color: TEXT_COLOR, fontSize: '1.2rem' }}>
                • You can only take this test once
              </Typography>
              <Typography variant="body2" sx={{ color: TEXT_COLOR, fontSize: '1.2rem' }}>
                • Answer all questions to get the best score
              </Typography>
              <Typography variant="body2" sx={{ color: TEXT_COLOR, fontSize: '1.2rem' }}>
                • Your score will be added to your total points
              </Typography>
              <Typography variant="body2" sx={{ color: TEXT_COLOR, fontSize: '1.2rem' }}>
                • You can review your answers after submission
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          onClick={onBack}
          sx={{
            color: ORANGE,
            borderColor: ORANGE,
            fontWeight: 600,
            borderRadius: 2,
            px: 4,
            py: 1.5,
            textTransform: 'none',
            background: 'transparent',
            ':hover': { background: 'rgba(255,175,27,0.08)', borderColor: ORANGE },
          }}
          variant="outlined"
        >
          Go Back
        </Button>
        <Button
          onClick={onStart}
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
          Start Test
        </Button>
      </Box>
    </Box>
  );
}
