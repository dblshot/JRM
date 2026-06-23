import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Grid } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ViewAssignments from '../components/ViewAssignments';
import CreateAssignmentForm from '../components/CreateAssignmentForm';

const ORANGE = '#ffaf1b';
const DARK_BG = '#181a20';
const DARKER_BG = '#23263a';
const WHITE = '#fff';
const GRAY = '#b0b3c6';

export default function AssignmentEditPage() {
  const [view, setView] = useState('view');
  const navigate = useNavigate();

  const handleBackToAdmin = () => {
    navigate('/admin');
  };

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
          Assignment Management
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
            View & Edit Assignments
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
            Create New Assignment
          </Button>
        </Grid>
      </Grid>

      {/* Content */}
      <Box maxWidth="1200px" mx="auto">
        {view === 'view' && (
          <ViewAssignments />
        )}
        {view === 'create' && (
          <CreateAssignmentForm onSubmit={() => setView('view')} />
        )}
      </Box>
    </Box>
  );
}
