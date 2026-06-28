import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Grid } from '@mui/material';
import CreateUserForm from '../components/CreateUserForm';
import Leaderboard from '../components/Leaderboard';
import SeeUsers from '../components/SeeUsers';
import ViewLessons from '../components/ViewLessons';
import CreateLessonForm from '../components/CreateLessonForm';
import ViewAssignments from '../components/ViewAssignments';
import CreateAssignmentForm from '../components/CreateAssignmentForm';
import TestStatus from '../components/TestStatus';

const ORANGE = '#ffaf1b';
const DARK_BG = '#181a20';
const DARKER_BG = '#23263a';
const WHITE = '#fff';
const GRAY = '#b0b3c6';

export default function Admin() {
  const [view, setView] = useState('leaderboard');
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.admin) {
      navigate('/'); // redirect to login
    }
  }, [navigate]);

  const handleTestManagement = () => {
    navigate('tests');
  };

  return (
    <Box minHeight="100vh" bgcolor={DARK_BG} px={{ xs: 1, sm: 4 }} py={6}>
      <Typography
        variant="h3"
        fontWeight="bold"
        align="center"
        gutterBottom
        sx={{ color: ORANGE }}
      >
        Welcome Back, Admin
      </Typography>
      <Grid container spacing={2} justifyContent="center" mb={4}>
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
            Create User
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant={view === 'leaderboard' ? 'contained' : 'outlined'}
            size="large"
            sx={{
              minWidth: 180,
              fontWeight: 'bold',
              fontSize: 18,
              bgcolor: view === 'leaderboard' ? ORANGE : DARKER_BG,
              color: view === 'leaderboard' ? DARK_BG : ORANGE,
              borderColor: ORANGE,
              '&:hover': {
                bgcolor: ORANGE,
                color: DARK_BG,
                borderColor: ORANGE,
              },
            }}
            onClick={() => setView('leaderboard')}
          >
            Leaderboard
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant={view === 'users' ? 'contained' : 'outlined'}
            size="large"
            sx={{
              minWidth: 180,
              fontWeight: 'bold',
              fontSize: 18,
              bgcolor: view === 'users' ? ORANGE : DARKER_BG,
              color: view === 'users' ? DARK_BG : ORANGE,
              borderColor: ORANGE,
              '&:hover': {
                bgcolor: ORANGE,
                color: DARK_BG,
                borderColor: ORANGE,
              },
            }}
            onClick={() => setView('users')}
          >
            See Users
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant={view === 'viewLessons' ? 'contained' : 'outlined'}
            size="large"
            sx={{
              minWidth: 180,
              fontWeight: 'bold',
              fontSize: 18,
              bgcolor: view === 'viewLessons' ? ORANGE : DARKER_BG,
              color: view === 'viewLessons' ? DARK_BG : ORANGE,
              borderColor: ORANGE,
              '&:hover': {
                bgcolor: ORANGE,
                color: DARK_BG,
                borderColor: ORANGE,
              },
            }}
            onClick={() => setView('viewLessons')}
          >
            View Lessons
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant={view === 'createLesson' ? 'contained' : 'outlined'}
            size="large"
            sx={{
              minWidth: 180,
              fontWeight: 'bold',
              fontSize: 18,
              bgcolor: view === 'createLesson' ? ORANGE : DARKER_BG,
              color: view === 'createLesson' ? DARK_BG : ORANGE,
              borderColor: ORANGE,
              '&:hover': {
                bgcolor: ORANGE,
                color: DARK_BG,
                borderColor: ORANGE,
              },
            }}
            onClick={() => setView('createLesson')}
          >
            Create Lesson
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            size="large"
            sx={{
              minWidth: 180,
              fontWeight: 'bold',
              fontSize: 18,
              bgcolor: DARKER_BG,
              color: ORANGE,
              borderColor: ORANGE,
              '&:hover': {
                bgcolor: ORANGE,
                color: DARK_BG,
                borderColor: ORANGE,
              },
            }}
            onClick={() => navigate('assignments')}
          >
            Assignment Management
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            size="large"
            sx={{
              minWidth: 180,
              fontWeight: 'bold',
              fontSize: 18,
              bgcolor: DARKER_BG,
              color: ORANGE,
              borderColor: ORANGE,
              '&:hover': {
                bgcolor: ORANGE,
                color: DARK_BG,
                borderColor: ORANGE,
              },
            }}
            onClick={handleTestManagement}
          >
            Test Management
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant={view === 'testStatus' ? 'contained' : 'outlined'}
            size="large"
            sx={{
              minWidth: 180,
              fontWeight: 'bold',
              fontSize: 18,
              bgcolor: view === 'testStatus' ? ORANGE : DARKER_BG,
              color: view === 'testStatus' ? DARK_BG : ORANGE,
              borderColor: ORANGE,
              '&:hover': {
                bgcolor: ORANGE,
                color: DARK_BG,
                borderColor: ORANGE,
              },
            }}
            onClick={() => setView('testStatus')}
          >
            Test Status
          </Button>
        </Grid>
      </Grid>
      <Box maxWidth="1000px" mx="auto">
        {view === 'leaderboard' && (
          <Leaderboard />
        )}
        {view === 'create' && (
          <CreateUserForm />
        )}
        {view === 'users' && (
          <SeeUsers />
        )}
        {view === 'viewLessons' && (
          <ViewLessons />
        )}
        {view === 'createLesson' && (
          <CreateLessonForm />
        )}
        {view === 'testStatus' && (
          <TestStatus />
        )}
        {view === 'assignmentManagement' && (
          <Box>
            <ViewAssignments />
            <Box mt={4}>
              <CreateAssignmentForm onSubmit={() => {}} />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
