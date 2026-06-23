import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Chip, Alert, LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import CheckIcon from '@mui/icons-material/Check';
import WarningIcon from '@mui/icons-material/Warning';

const ORANGE = '#ffaf1b';
const DARK_BG = '#181a20';
const CARD_BG = '#23263a';
const TEXT_COLOR = 'white';
const GRAY = '#b0b3c6';

export default function TestTaking({ test, onSubmit, onBack }) {
  // --- LocalStorage Progress Key ---
  const progressKey = test?._id ? `test-progress-${test._id}` : null;

  // --- Hydration state ---
  const [hydrated, setHydrated] = useState(false);

  // --- Initial state (will be set after hydration) ---
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [timeLeft, setTimeLeft] = useState(test?.timeLimit || 120);
  const [startTime, setStartTime] = useState(Date.now());

  // --- Load progress after test is loaded ---
  useEffect(() => {
    if (!progressKey || !test) return;
    const saved = localStorage.getItem(progressKey);
    if (saved) {
      try {
        const { answers: savedAnswers, timeLeft: savedTimeLeft, currentQuestion: savedCurrentQuestion, lastUpdated, startTime: savedStartTime } = JSON.parse(saved);
        if (savedAnswers) setAnswers(savedAnswers);
        if (typeof savedCurrentQuestion === 'number') setCurrentQuestion(savedCurrentQuestion);
        if (typeof savedStartTime === 'number') setStartTime(savedStartTime);
        // Timer persistence: recalculate timeLeft based on wall clock
        if (typeof savedTimeLeft === 'number' && lastUpdated) {
          const elapsed = Math.floor((Date.now() - lastUpdated) / 1000);
          const newTimeLeft = savedTimeLeft - elapsed;
          setTimeLeft(newTimeLeft > 0 ? newTimeLeft : 0);
        } else if (typeof savedTimeLeft === 'number') {
          setTimeLeft(savedTimeLeft);
        }
      } catch (e) {
        // ignore parse errors
      }
    } else {
      // If no saved progress, reset to defaults
      setAnswers({});
      setCurrentQuestion(0);
      setTimeLeft(test?.timeLimit || 120);
      setStartTime(Date.now());
    }
    setHydrated(true);
    // eslint-disable-next-line
  }, [progressKey, test]);

  // --- Save progress on answers/timeLeft/currentQuestion/startTime change ---
  useEffect(() => {
    if (!progressKey || !hydrated) return;
    localStorage.setItem(progressKey, JSON.stringify({ answers, timeLeft, currentQuestion, lastUpdated: Date.now(), startTime }));
  }, [answers, timeLeft, currentQuestion, progressKey, hydrated, startTime]);

  const formatTime = (seconds) => {
    if (seconds < 0) return "Time's up!";
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

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const getAnsweredQuestionsCount = () => Object.keys(answers).length;
  const getProgressPercentage = () => (getAnsweredQuestionsCount() / test.questions.length) * 100;
  const currentQuestionData = test?.questions?.[currentQuestion];

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }));
    setCurrentQuestion(questionIndex); // Save current question on answer
  };
  const handleNext = () => {
    if (currentQuestion < test.questions.length - 1) setCurrentQuestion(currentQuestion + 1);
  };
  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };
  const handleSubmit = () => {
    // --- Clear progress on submit ---
    if (progressKey) localStorage.removeItem(progressKey);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const answersArray = Object.entries(answers).map(([questionIndex, selectedAnswer]) => ({
      questionIndex: parseInt(questionIndex),
      selectedAnswer
    }));
    onSubmit(answersArray, timeTaken);
  };

  if (!hydrated) {
    return <Box sx={{ textAlign: 'center', color: TEXT_COLOR }}><Typography variant="h5">Loading test progress...</Typography></Box>;
  }

  if (!currentQuestionData) {
    return <Box sx={{ textAlign: 'center', color: TEXT_COLOR }}><Typography variant="h5">Loading question...</Typography></Box>;
  }

  return (
    <Box sx={{ width: '100%', padding: '1rem', minHeight: '100vh', background: DARK_BG }}>
      {/* Header with Progress */}
      <Box sx={{ background: CARD_BG, borderRadius: 12, p: 3, mb: 3, maxWidth: 800, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ color: ORANGE, fontWeight: 'bold' }}>{test?.lessonId?.title || 'Test'}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              icon={<TimerIcon />}
              label={formatTime(timeLeft)}
              sx={{ 
                background: timeLeft < 30 ? '#f44336' : 'rgba(255,175,27,0.1)', 
                color: timeLeft < 30 ? 'white' : ORANGE, 
                fontWeight: 600 
              }}
            />
            <Typography variant="body2" sx={{ color: GRAY }}>Question {currentQuestion + 1} of {test.questions.length}</Typography>
          </Box>
        </Box>
        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ color: GRAY }}>Progress: {getAnsweredQuestionsCount()}/{test.questions.length} answered</Typography>
            <Typography variant="body2" sx={{ color: GRAY }}>{Math.round(getProgressPercentage())}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={getProgressPercentage()} sx={{ height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { backgroundColor: ORANGE } }} />
        </Box>
        {/* Question Navigation */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {test.questions.map((_, index) => (
            <Button
              key={index}
              size="small"
              onClick={() => setCurrentQuestion(index)}
              sx={{ minWidth: 40, height: 32, borderRadius: 2, backgroundColor: index === currentQuestion ? ORANGE : answers[index] !== undefined ? '#4caf50' : 'rgba(255,255,255,0.1)', color: index === currentQuestion ? DARK_BG : 'white', fontWeight: 'bold', '&:hover': { backgroundColor: index === currentQuestion ? '#ff9900' : 'rgba(255,255,255,0.2)' } }}
            >{index + 1}</Button>
          ))}
        </Box>
      </Box>
      {/* Current Question */}
      <Box sx={{ background: CARD_BG, borderRadius: 12, p: 4, mb: 3, maxWidth: 800, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ color: ORANGE, fontWeight: 'bold' }}>Question {currentQuestion + 1}</Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip label={currentQuestionData.difficulty} size="small" sx={{ background: getDifficultyColor(currentQuestionData.difficulty), color: 'white', fontWeight: 600 }} />
            <Typography variant="body2" sx={{ color: GRAY }}>{currentQuestionData.basePoints} points</Typography>
          </Box>
        </Box>
        <Typography variant="body1" sx={{ color: TEXT_COLOR, mb: 3, fontSize: 18, lineHeight: 1.6 }}>{currentQuestionData.text}</Typography>
        {/* Answer Choices */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {currentQuestionData.choices.map((choice, index) => (
            <Button
              key={index}
              onClick={() => handleAnswerSelect(currentQuestion, index)}
              sx={{ justifyContent: 'flex-start', textAlign: 'left', padding: 2, borderRadius: 2, backgroundColor: answers[currentQuestion] === index ? 'rgba(255,175,27,0.2)' : 'rgba(255,255,255,0.05)', border: answers[currentQuestion] === index ? `2px solid ${ORANGE}` : '2px solid transparent', color: TEXT_COLOR, fontWeight: answers[currentQuestion] === index ? 'bold' : 'normal', '&:hover': { backgroundColor: answers[currentQuestion] === index ? 'rgba(255,175,27,0.3)' : 'rgba(255,255,255,0.1)' } }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Box sx={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${ORANGE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: answers[currentQuestion] === index ? ORANGE : 'transparent' }}>{answers[currentQuestion] === index && (<CheckIcon sx={{ fontSize: 16, color: DARK_BG }} />)}</Box>
                <Typography variant="body1" sx={{ fontWeight: 'inherit' }}>{String.fromCharCode(65 + index)}. {choice}</Typography>
              </Box>
            </Button>
          ))}
        </Box>
      </Box>
      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, maxWidth: 800, mx: 'auto' }}>
        <Button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          startIcon={<NavigateBeforeIcon />}
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
          Previous
        </Button>
        {currentQuestion < test.questions.length - 1 ? (
          <Button
            onClick={handleNext}
            endIcon={<NavigateNextIcon />}
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
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={() => setShowSubmitDialog(true)}
            sx={{
              color: 'white',
              background: '#4caf50',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              ':hover': { background: '#45a049' },
            }}
            variant="contained"
          >
            Submit Test
          </Button>
        )}
      </Box>
      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onClose={() => setShowSubmitDialog(false)} PaperProps={{ sx: { background: CARD_BG, color: TEXT_COLOR, borderRadius: 3, minWidth: 400 } }}>
        <DialogTitle sx={{ color: ORANGE, fontWeight: 700, fontSize: 22, textAlign: 'center' }}>Submit Test?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: TEXT_COLOR, fontSize: 16, textAlign: 'center', mb: 2 }}>Are you sure you want to submit your test?</Typography>
          <Box sx={{ background: DARK_BG, borderRadius: 8, p: 2, mb: 2 }}>
            <Typography variant="body2" sx={{ color: GRAY, textAlign: 'center' }}>Answered: {getAnsweredQuestionsCount()}/{test.questions.length} questions</Typography>
            <Typography variant="body2" sx={{ color: GRAY, textAlign: 'center' }}>Time remaining: {formatTime(timeLeft)}</Typography>
          </Box>
          {getAnsweredQuestionsCount() < test.questions.length && (
            <Alert severity="warning" sx={{ mb: 2 }}>You haven't answered all questions. You can still submit, but unanswered questions will be marked as incorrect.</Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={() => setShowSubmitDialog(false)}
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
            Continue Test
          </Button>
          <Button
            onClick={handleSubmit}
            sx={{
              color: 'white',
              background: '#4caf50',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              ':hover': { background: '#45a049' },
            }}
            variant="contained"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
