import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Alert,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Swal from 'sweetalert2';
import '../styles/sweetalert2-theme-override.css';

const ORANGE = '#ffaf1b';
const DARK_BG = '#181a20';
const CARD_BG = '#23263a';
const TEXT_COLOR = 'white';
const GRAY = '#b0b3c6';

const COURSE_RATINGS = [
  { value: 1, label: '⭐ Poor' },
  { value: 2, label: '⭐⭐ Fair' },
  { value: 3, label: '⭐⭐⭐ Good' },
  { value: 4, label: '⭐⭐⭐⭐ Very Good' },
  { value: 5, label: '⭐⭐⭐⭐⭐ Excellent' },
];

const ACTIVITIES = [
  'Team Challenges',
  'Marketing Games',
  'Group Project (Agency Challenge)',
  'Class Discussions',
  'Presentations',
];

const SKILLS = [
  'Teamwork',
  'Creativity',
  'Public Speaking & Presentation',
  'Marketing Knowledge',
  'Leadership',
  'Problem Solving',
  'Confidence',
];

const RECOMMEND = [
  { value: 'Definitely Yes', label: 'Definitely Yes 🤩' },
  { value: 'Maybe', label: 'Maybe 😊' },
  { value: 'Not Sure', label: 'Not Sure 🤔' },
  { value: 'No', label: 'No 😔' },
];

const radioSx = {
  color: ORANGE,
  '&.Mui-checked': { color: ORANGE },
};

const labelSx = {
  color: TEXT_COLOR,
  '& .MuiFormControlLabel-label': { color: TEXT_COLOR, fontSize: '1rem' },
};

function QuestionCard({ number, title, children }) {
  return (
    <Box sx={{ background: CARD_BG, borderRadius: 3, p: 3, mb: 3 }}>
      <Typography sx={{ color: ORANGE, fontWeight: 700, fontSize: 18, mb: 2 }}>
        {number}. {title}
      </Typography>
      {children}
    </Box>
  );
}

export default function FeedbackPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [courseContentRating, setCourseContentRating] = useState('');
  const [favoriteActivity, setFavoriteActivity] = useState('');
  const [instructorRating, setInstructorRating] = useState('');
  const [mostImportantSkill, setMostImportantSkill] = useState('');
  const [improvementSuggestion, setImprovementSuggestion] = useState('');
  const [recommendToFriend, setRecommendToFriend] = useState('');

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem('user'));
    if (!localUser) {
      navigate('/');
      return;
    }
    setUser(localUser);

    const checkStatus = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL;
        const res = await fetch(`${API_BASE}/feedback/status/${localUser._id}`);
        if (res.ok) {
          const data = await res.json();
          setAlreadySubmitted(!!data.submitted);
        }
      } catch (_) {
        // ignore — form still usable
      } finally {
        setChecking(false);
      }
    };
    checkStatus();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!courseContentRating || !favoriteActivity || !instructorRating || !mostImportantSkill) {
      setError('Please answer all required questions (1–4).');
      return;
    }

    setSubmitting(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?._id,
          username: user?.username,
          displayName: user?.displayName || user?.username,
          courseContentRating: Number(courseContentRating),
          favoriteActivity,
          instructorRating: Number(instructorRating),
          mostImportantSkill,
          improvementSuggestion: improvementSuggestion.trim(),
          recommendToFriend,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit feedback');

      setAlreadySubmitted(true);
      Swal.fire({
        title: 'Thank you!',
        text: 'Your feedback has been submitted successfully.',
        icon: 'success',
        background: DARK_BG,
        color: 'white',
        confirmButtonColor: ORANGE,
        confirmButtonText: 'OK',
        customClass: { popup: 'swal2-dark' },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <Box sx={{ minHeight: '100vh', background: DARK_BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: ORANGE }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: DARK_BG, py: 4, px: 2 }}>
      <Box sx={{ maxWidth: 720, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/welcome')} sx={{ color: ORANGE, mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ color: ORANGE, fontWeight: 800 }}>
            End of Course Feedback
          </Typography>
        </Box>

        <Typography sx={{ color: GRAY, mb: 4, textAlign: 'center' }}>
          Junior Marketer — help us make the next program even better.
        </Typography>

        {alreadySubmitted ? (
          <Alert
            severity="success"
            sx={{
              background: 'rgba(76,175,80,0.12)',
              color: TEXT_COLOR,
              border: '1px solid #4caf50',
              '& .MuiAlert-icon': { color: '#4caf50' },
            }}
          >
            You have already submitted your feedback. Thank you!
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <QuestionCard number="1" title="How would you rate the course content?">
              <FormControl>
                <RadioGroup
                  value={courseContentRating}
                  onChange={(e) => setCourseContentRating(e.target.value)}
                >
                  {COURSE_RATINGS.map((opt) => (
                    <FormControlLabel
                      key={opt.value}
                      value={String(opt.value)}
                      control={<Radio sx={radioSx} />}
                      label={opt.label}
                      sx={labelSx}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </QuestionCard>

            <QuestionCard number="2" title="Which activity did you enjoy the most?">
              <FormControl>
                <RadioGroup
                  value={favoriteActivity}
                  onChange={(e) => setFavoriteActivity(e.target.value)}
                >
                  {ACTIVITIES.map((opt) => (
                    <FormControlLabel
                      key={opt}
                      value={opt}
                      control={<Radio sx={radioSx} />}
                      label={opt}
                      sx={labelSx}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </QuestionCard>

            <QuestionCard number="3" title="How would you rate the instructor?">
              <FormControl>
                <RadioGroup
                  value={instructorRating}
                  onChange={(e) => setInstructorRating(e.target.value)}
                >
                  {COURSE_RATINGS.map((opt) => (
                    <FormControlLabel
                      key={opt.value}
                      value={String(opt.value)}
                      control={<Radio sx={radioSx} />}
                      label={opt.label}
                      sx={labelSx}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </QuestionCard>

            <QuestionCard number="4" title="What is the MOST important skill you gained from this program?">
              <FormControl>
                <RadioGroup
                  value={mostImportantSkill}
                  onChange={(e) => setMostImportantSkill(e.target.value)}
                >
                  {SKILLS.map((opt) => (
                    <FormControlLabel
                      key={opt}
                      value={opt}
                      control={<Radio sx={radioSx} />}
                      label={opt}
                      sx={labelSx}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </QuestionCard>

            <QuestionCard number="5" title="What can we improve to make the next Junior Marketer program even better?">
              <TextField
                fullWidth
                multiline
                minRows={3}
                placeholder="Share your thoughts..."
                value={improvementSuggestion}
                onChange={(e) => setImprovementSuggestion(e.target.value)}
                sx={{
                  '& .MuiInputBase-input': { color: TEXT_COLOR },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#31344b' },
                    '&:hover fieldset': { borderColor: ORANGE },
                    '&.Mui-focused fieldset': { borderColor: ORANGE },
                  },
                }}
              />
            </QuestionCard>

            <QuestionCard number="Bonus" title="Would you recommend Junior Marketer to a friend? (optional)">
              <FormControl>
                <RadioGroup
                  value={recommendToFriend}
                  onChange={(e) => setRecommendToFriend(e.target.value)}
                >
                  {RECOMMEND.map((opt) => (
                    <FormControlLabel
                      key={opt.value}
                      value={opt.value}
                      control={<Radio sx={radioSx} />}
                      label={opt.label}
                      sx={labelSx}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </QuestionCard>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 4 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{
                  background: ORANGE,
                  color: DARK_BG,
                  fontWeight: 700,
                  fontSize: 16,
                  px: 6,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  ':hover': { background: '#ff9900' },
                }}
              >
                {submitting ? <CircularProgress size={22} sx={{ color: DARK_BG }} /> : 'Submit Feedback'}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
