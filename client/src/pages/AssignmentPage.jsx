import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, Chip, Alert, Paper, IconButton } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Swal from 'sweetalert2';
import '../styles/sweetalert2-theme-override.css';

const ORANGE = '#ffaf1b';
const DARK_BG = '#181a20';
const CARD_BG = '#23263a';
const TEXT_COLOR = 'white';
const GRAY = '#b0b3c6';

export default function AssignmentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(null);
  const [user, setUser] = useState(null);

  // Get assignment from navigation state
  const assignment = location.state?.assignment;

  // Always fetch the latest user from the backend on mount and after upload
  const fetchUser = async () => {
    const localUser = JSON.parse(localStorage.getItem('user'));
    if (localUser?._id) {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/${localUser._id}`);
      if (res.ok) {
        const freshUser = await res.json();
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
      }
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line
  }, []);

  // Check if already submitted
  useEffect(() => {
    if (user && assignment?._id) {
      const found = (user.completedAssignments || []).find(a =>
        (a.assignmentId === assignment._id) ||
        (a.assignmentId?._id === assignment._id)
      );
      setAlreadySubmitted(found || null);
    }
  }, [user, assignment]);

  if (!assignment) {
    return (
      <Box sx={{ minHeight: '100vh', background: DARK_BG, color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h4" sx={{ color: ORANGE, mb: 2 }}>No Assignment Found</Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>There is no assignment linked to this lesson.</Typography>
        <Button onClick={() => navigate(-1)} sx={{ color: ORANGE, borderColor: ORANGE }} variant="outlined">Go Back</Button>
      </Box>
    );
  }

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const handleBack = () => {
    navigate('/welcome');
  };

  const handleUpload = async () => {
    if (!file) {
      Swal.fire({
        title: 'No file selected',
        text: 'Please select a file to upload.',
        icon: 'warning',
        background: DARK_BG,
        color: 'white',
        confirmButtonColor: ORANGE,
        confirmButtonText: 'OK',
        customClass: { popup: 'swal2-dark' }
      });
      return;
    }

    setUploading(true);

    const CLOUD_NAME = 'dqivy8zb5'; // Replace with yours
    const UPLOAD_PRESET = 'student_uploads'; // Replace with your unsigned preset

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('resource_type', 'raw'); // optional; Cloudinary auto-detects

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.secure_url) {
        // Update completedAssignments in backend
        const localUser = JSON.parse(localStorage.getItem('user'));
        const userId = localUser?._id;
        if (userId) {
          await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/${userId}/complete-assignment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assignmentId: assignment._id, fileUrl: data.secure_url })
          });
          // Fetch updated user and update localStorage/UI
          await fetchUser();
        }
        setFile(null);
        Swal.fire({
          title: 'Success!',
          text: 'Assignment uploaded and recorded successfully!',
          icon: 'success',
          background: DARK_BG,
          color: 'white',
          confirmButtonColor: ORANGE,
          confirmButtonText: 'OK',
          customClass: { popup: 'swal2-dark' }
        });
      } else {
        console.error('❌ Upload failed:', data);
        Swal.fire({
          title: 'Upload failed',
          text: 'There was a problem uploading your assignment.',
          icon: 'error',
          background: DARK_BG,
          color: 'white',
          confirmButtonColor: ORANGE,
          confirmButtonText: 'OK',
          customClass: { popup: 'swal2-dark' }
        });
      }
    } catch (err) {
      console.error('❌ Upload error:', err);
      Swal.fire({
        title: 'Upload error',
        text: 'There was a problem uploading your assignment.',
        icon: 'error',
        background: DARK_BG,
        color: 'white',
        confirmButtonColor: ORANGE,
        confirmButtonText: 'OK',
        customClass: { popup: 'swal2-dark' }
      });
    }

    setUploading(false);
  };

  // Format due date for display
  const formattedDueDate = assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : null;

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
          onClick={() => navigate(-1)}
          sx={{ 
            color: ORANGE,
            '&:hover': { background: 'rgba(255,175,27,0.08)' }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h3" sx={{ color: ORANGE, fontWeight: 'bold', ml: 2 }}>
          Assignment Details
        </Typography>
      </Box>

      {/* Assignment Info */}
      <Box sx={{ background: CARD_BG, borderRadius: 12, p: 3, mb: 4, maxWidth: 800, mx: 'auto', textAlign: 'center' }}>
        <Typography variant="h5" sx={{ color: TEXT_COLOR, mb: 2, fontSize: '2.5rem' }}>
          {assignment.title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', textAlign: 'center', justifyContent: 'center', mb: 2 }}>
          <Chip 
            icon={<EmojiEventsIcon />}
            label={`${assignment.points} Points`}
            sx={{ 
              background: 'rgba(255,175,27,0.1)', 
              color: ORANGE, 
              fontWeight: 600 
            }}
          />
          {formattedDueDate && (
            <Chip 
              icon={<AssignmentIcon />}
              label={`Due: ${formattedDueDate}`}
              sx={{ 
                background: 'rgba(255,175,27,0.1)', 
                color: ORANGE, 
                fontWeight: 600 
              }}
            />
          )}
        </Box>
      </Box>

      {/* Assignment Description */}
      <Box sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h5" sx={{ color: ORANGE, fontWeight: 'bold', mb: 3 }}>
          Assignment Description
        </Typography>
        <Box sx={{ background: CARD_BG, borderRadius: 8, p: 3 }}>
          <Typography variant="body1" sx={{ color: TEXT_COLOR, fontSize: '1.1rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
            {assignment.description}
          </Typography>
          {assignment.imageUrl && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <a href={assignment.imageUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={assignment.imageUrl}
                  alt="Assignment reference"
                  style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 8, border: '1px solid #31344b' }}
                />
              </a>
            </Box>
          )}
        </Box>
      </Box>

      {/* Upload Section */}
      <Box sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h5" sx={{ color: ORANGE, fontWeight: 'bold', mb: 3 }}>
          Submit Your Assignment
        </Typography>
        {alreadySubmitted ? (
          <Alert severity="info" sx={{ mb: 3 }} icon={false}>
            <CheckCircleIcon sx={{ color: '#4caf50', mr: 1, verticalAlign: 'middle' }} />
            You have already submitted this assignment.<br />
            <span style={{ fontWeight: 600 }}>
              Submitted on: {new Date(alreadySubmitted.uploadedAt).toLocaleString()}
            </span>
            <br />
            {alreadySubmitted.graded ? (
              <span style={{ color: '#4caf50', fontWeight: 600 }}>
                Graded! Your grade: {alreadySubmitted.grade}/{assignment.points}
              </span>
            ) : (
              <span style={{ color: '#ff3d3d', fontWeight: 600 }}>
                Not graded yet
              </span>
            )}
          </Alert>
        ) : (
        <Paper 
          elevation={3}
          sx={{ 
            background: CARD_BG, 
            borderRadius: 8, 
            p: 4,
            border: '2px dashed rgba(255,175,27,0.3)',
            textAlign: 'center',
            mb: 3
          }}
        >
          <UploadFileIcon sx={{ fontSize: 64, color: ORANGE, mb: 2 }} />
          
          <Typography variant="h6" sx={{ color: TEXT_COLOR, mb: 2 }}>
            Upload your assignment file
          </Typography>
          
          <Typography variant="body2" sx={{ color: GRAY, mb: 3 }}>
            Supported formats: PDF, DOC, DOCX, Images (JPG, PNG) (Max 10MB)
          </Typography>

          <Box sx={{ mb: 3 }}>
            <input
              accept=".pdf,.doc,.docx,image/*"
              style={{ display: 'none' }}
              id="assignment-file"
              type="file"
              onChange={handleFileChange}
              disabled={alreadySubmitted}
            />
            <label htmlFor="assignment-file">
              <Button
                component="span"
                variant={file ? "contained" : "outlined"}
                sx={{
                  color: file ? 'white' : ORANGE,
                  borderColor: ORANGE,
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  background: file ? ORANGE : 'transparent',
                  ':hover': { 
                    background: file ? '#ff9900' : 'rgba(255,175,27,0.08)', 
                    borderColor: ORANGE 
                  },
                }}
                disabled={alreadySubmitted}
              >
                {file ? 'Choose Different File' : 'Choose File'}
              </Button>
            </label>
          </Box>

          {file && (
            <Box sx={{ 
              mb: 3, 
              background: 'rgba(76, 175, 80, 0.1)', 
              borderRadius: 2, 
              p: 2, 
              border: '1px solid rgba(76, 175, 80, 0.3)'
            }}>
              <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 600, mb: 1 }}>
                ✓ File Selected: {file.name}
              </Typography>
              <Typography variant="body2" sx={{ color: GRAY }}>
                Size: {(file.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
            </Box>
          )}
        </Paper>
        )}
        {/* Warning */}
        <Box sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
          <Alert 
            severity="warning" 
            sx={{ 
              fontSize: '1.1rem',
              alignItems: 'center',
              '& .MuiAlert-icon': {
                alignItems: 'center'
              },
              '& .MuiAlert-message': {
                fontSize: '1.1rem',
                fontWeight: 600
              }
            }}
          >
            Important: Make sure to review your assignment before submitting. You can only submit once!
          </Alert>
        </Box>
        {/* Upload Assignment Button - Outside the file upload box */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Button
            onClick={handleUpload}
            disabled={!file || uploading || alreadySubmitted}
            sx={{
              color: 'white',
              background: ORANGE,
              fontWeight: 600,
              borderRadius: 2,
              px: 6,
              py: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
              ':hover': { background: '#ff9900' },
              ':disabled': { background: GRAY, color: 'white' }
            }}
            variant="contained"
            startIcon={<UploadFileIcon />}
          >
            {uploading ? 'Uploading...' : 'Upload Assignment'}
          </Button>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          onClick={handleBack}
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
    </Box>
  );
}
