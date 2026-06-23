import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, Grid, Alert, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ViewTests from '../components/ViewTests';
import CreateTestForm from '../components/CreateTestForm';
import useAllTests from '../hooks/useAllTests';

const ORANGE = '#ffaf1b';
const DARK_BG = '#181a20';
const DARKER_BG = '#23263a';
const WHITE = '#fff';
const GRAY = '#b0b3c6';

export default function TestEditPage() {
  const [view, setView] = useState('view');
  const navigate = useNavigate();
  const location = useLocation();
  const { tests, loading, error, refetch } = useAllTests();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.admin) {
      navigate('/'); // redirect to login
    }
  }, [navigate]);

  // Check if we came from a specific test (for direct editing)
  useEffect(() => {
    if (location.state?.testId) {
      const test = tests.find(t => t._id === location.state.testId);
      if (test) {
        // You could set up direct editing here if needed
      }
    }
  }, [location.state, tests]);

  const handleTestCreated = (newTest) => {
    refetch();
    setView('view');
  };

  const handleBackToAdmin = () => {
    navigate('/admin');
  };

  if (loading) {
    return (
      <Box minHeight="100vh" bgcolor={DARK_BG} display="flex" alignItems="center" justifyContent="center">
        <CircularProgress sx={{ color: ORANGE }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box minHeight="100vh" bgcolor={DARK_BG} px={{ xs: 1, sm: 4 }} py={6}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button
          onClick={handleBackToAdmin}
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
          Back to Admin
        </Button>
      </Box>
    );
  }

  return (
    <Box minHeight="100vh" bgcolor={DARK_BG} px={{ xs: 1, sm: 4 }} py={6}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={4}>
        <Button
          onClick={handleBackToAdmin}
          sx={{
            color: ORANGE,
            mr: 2,
            minWidth: 'auto',
            p: 1,
          }}
        >
          <ArrowBackIcon />
        </Button>
        <Typography
          variant="h3"
          fontWeight="bold"
          sx={{ color: ORANGE }}
        >
          Test Management
        </Typography>
      </Box>

      {/* Navigation Tabs */}
      <Grid container spacing={2} justifyContent="center" mb={4}>
        <Grid item>
          <Button
            variant={view === 'view' ? 'contained' : 'outlined'}
            size="large"
            sx={{
              minWidth: 180,
              fontWeight: 'bold',
              fontSize: 18,
              bgcolor: view === 'view' ? ORANGE : DARKER_BG,
              color: view === 'view' ? DARK_BG : ORANGE,
              borderColor: ORANGE,
              '&:hover': {
                bgcolor: ORANGE,
                color: DARK_BG,
                borderColor: ORANGE,
              },
            }}
            onClick={() => setView('view')}
          >
            View & Edit Tests
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant={view === 'create' ? 'contained' : 'outlined'}
            size="large"
            sx={{
              minWidth: 180,
              fontWeight: 'bold',
              fontSize: 18,
              bgcolor: view === 'create' ? ORANGE : DARKER_BG,
              color: view === 'create' ? DARK_BG : ORANGE,
              borderColor: ORANGE,
              '&:hover': {
                bgcolor: ORANGE,
                color: DARK_BG,
                borderColor: ORANGE,
              },
            }}
            onClick={() => setView('create')}
          >
            Create New Test
          </Button>
        </Grid>
      </Grid>

      {/* Content */}
      <Box maxWidth="1200px" mx="auto">
        {view === 'view' && (
          <ViewTests />
        )}
        {view === 'create' && (
          <CreateTestForm onSubmit={handleTestCreated} />
        )}
      </Box>
    </Box>
  );
}
