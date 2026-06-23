import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import TestInstructions from '../components/TestInstructions';
import TestTaking from '../components/TestTaking';
import TestResults from '../components/TestResults';
import useTestCompletion from '../hooks/useTestCompletion';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const DARK_BG = '#181a20';
const ORANGE = '#ffaf1b';

export default function TestTakingPage() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?._id;

  // Check if user is logged in and has userId
  useEffect(() => {
    if (!user || !userId) {
      // Clear any incomplete user data and redirect to login
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/');
      return;
    }
  }, [user, userId, navigate]);

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showTest, setShowTest] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState(null);

  const { hasCompleted, completedTest, loading: completionLoading } = useTestCompletion(testId, userId);

  useEffect(() => {
    async function fetchTest() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/tests/${testId}`);
        if (!res.ok) throw new Error('Failed to fetch test');
        const data = await res.json();
        setTest(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (testId) fetchTest();
  }, [testId]);

  // --- Skip instructions if progress exists ---
  useEffect(() => {
    if (test && test._id) {
      const progressKey = `test-progress-${test._id}`;
      const saved = localStorage.getItem(progressKey);
      if (saved) {
        setShowInstructions(false);
        setShowTest(true);
      }
    }
  }, [test]);

  const handleStart = () => {
    setShowInstructions(false);
    setShowTest(true);
  };

  const handleBack = () => {
    navigate('/welcome');
  };

  const handleSubmit = async (answersArray, timeTaken) => {
    try {
      // Validate userId exists
      if (!userId) {
        throw new Error('User not authenticated. Please log in again.');
      }

      // Validate answers array
      if (!answersArray || !Array.isArray(answersArray) || answersArray.length === 0) {
        throw new Error('No answers provided. Please answer at least one question.');
      }

      setShowTest(false);
      setLoading(true);
      
      const requestBody = { userId, answers: answersArray, timeTaken };
      console.log('Submitting test with:', requestBody); // Debug log
      
      const res = await fetch(`${API_BASE}/tests/${testId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to submit test');
      }
      
      const data = await res.json();
      setResult(data.result);
      setShowResults(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading || completionLoading) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: DARK_BG,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white'
        }}
      >
        <CircularProgress sx={{ color: ORANGE, mb: 2 }} size={60} />
        <Typography variant="h5" sx={{ color: ORANGE, fontWeight: 'bold' }}>
          Loading Test...
        </Typography>
        <Typography variant="body1" sx={{ color: 'white', mt: 1 }}>
          Please wait while we prepare your test
        </Typography>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: DARK_BG,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'red'
        }}
      >
        <Typography variant="h5" sx={{ color: 'red', fontWeight: 'bold', mb: 2 }}>
          Error Loading Test
        </Typography>
        <Typography variant="body1" sx={{ color: 'white', textAlign: 'center', maxWidth: 600 }}>
          {error}
        </Typography>
        <Box sx={{ mt: 3 }}>
          <button
            onClick={() => navigate('/welcome')}
            style={{
              background: ORANGE,
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Go Back
          </button>
        </Box>
      </Box>
    );
  }
  
  if (!test) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: DARK_BG,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white'
        }}
      >
        <Typography variant="h5" sx={{ color: ORANGE, fontWeight: 'bold', mb: 2 }}>
          Test Not Found
        </Typography>
        <Typography variant="body1" sx={{ color: 'white', mb: 3 }}>
          The test you're looking for doesn't exist.
        </Typography>
        <button
          onClick={() => navigate('/welcome')}
          style={{
            background: ORANGE,
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Go Back
        </button>
      </Box>
    );
  }

  // If already completed, show preview/results mode
  if (hasCompleted && completedTest) {
    return (
      <TestResults
        result={completedTest}
        test={test}
        onBack={handleBack}
      />
    );
  }
  if (showInstructions) {
    return (
      <TestInstructions 
        test={test} 
        onStart={handleStart} 
        onBack={handleBack} 
        hasCompleted={hasCompleted} 
        completedTest={completedTest}
      />
    );
  }
  if (showTest) {
    return (
      <TestTaking 
        test={test} 
        onSubmit={handleSubmit} 
        onBack={handleBack} 
      />
    );
  }
  if (showResults && result) {
    return (
      <TestResults 
        result={result} 
        test={test} 
        onBack={handleBack} 
      />
    );
  }
  return null;
}
