import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function EditLessonForm({ lesson, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    title: lesson.title || '',
    videoLink: lesson.videoLink || '',
    slidesLink: lesson.slidesLink || '',
    links: lesson.links ? lesson.links.map(l => ({ label: l.label || '', url: l.url || '' })) : [],
    notes: lesson.notes || ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLinkChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.map((l, i) => (i === index ? { ...l, [field]: value } : l))
    }));
  };
  const addLink = () => setFormData(prev => ({ ...prev, links: [...prev.links, { label: '', url: '' }] }));
  const removeLink = (index) => setFormData(prev => ({ ...prev, links: prev.links.filter((_, i) => i !== index) }));

  const linkFieldSx = {
    '& .MuiInputLabel-root': { color: '#b0b3c6' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#ffaf1b' },
    '& .MuiInputBase-input': { color: 'white' },
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: '#31344b' },
      '&:hover fieldset': { borderColor: '#ffaf1b' },
      '&.Mui-focused fieldset': { borderColor: '#ffaf1b' },
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${API_BASE}/lessons/${lesson._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          links: formData.links.filter(l => l.label.trim() && l.url.trim())
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update lesson');
      }

      setSuccess('Lesson updated successfully!');
      onUpdate(data.lesson);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#ffaf1b' }}>
        Edit Lesson
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <TextField
        fullWidth
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        margin="normal"
        required
        sx={{
          '& .MuiInputLabel-root': {
            color: '#b0b3c6',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#ffaf1b',
          },
          '& .MuiInputBase-input': {
            color: 'white',
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#31344b',
            },
            '&:hover fieldset': {
              borderColor: '#ffaf1b',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#ffaf1b',
            },
          },
        }}
      />

      <TextField
        fullWidth
        label="Video Link"
        name="videoLink"
        value={formData.videoLink}
        onChange={handleChange}
        margin="normal"
        sx={{
          '& .MuiInputLabel-root': {
            color: '#b0b3c6',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#ffaf1b',
          },
          '& .MuiInputBase-input': {
            color: 'white',
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#31344b',
            },
            '&:hover fieldset': {
              borderColor: '#ffaf1b',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#ffaf1b',
            },
          },
        }}
      />

      <TextField
        fullWidth
        label="Slides Link"
        name="slidesLink"
        value={formData.slidesLink}
        onChange={handleChange}
        margin="normal"
        sx={{
          '& .MuiInputLabel-root': {
            color: '#b0b3c6',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#ffaf1b',
          },
          '& .MuiInputBase-input': {
            color: 'white',
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#31344b',
            },
            '&:hover fieldset': {
              borderColor: '#ffaf1b',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#ffaf1b',
            },
          },
        }}
      />

      <Box sx={{ mt: 2 }}>
        <Typography sx={{ color: '#ffaf1b', fontWeight: 600, fontSize: 15, mb: 1 }}>
          Additional Links
        </Typography>
        {formData.links.map((link, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
            <TextField
              label="Label"
              value={link.label}
              onChange={e => handleLinkChange(index, 'label', e.target.value)}
              size="small"
              sx={{ ...linkFieldSx, flex: '0 0 35%' }}
            />
            <TextField
              label="URL"
              value={link.url}
              onChange={e => handleLinkChange(index, 'url', e.target.value)}
              size="small"
              sx={{ ...linkFieldSx, flex: 1 }}
            />
            <IconButton onClick={() => removeLink(index)} sx={{ color: '#ff5252' }} aria-label="Remove link">
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
        <Button
          onClick={addLink}
          variant="outlined"
          fullWidth
          sx={{ borderColor: '#ffaf1b', color: '#ffaf1b', borderStyle: 'dashed', textTransform: 'none', mt: 0.5, '&:hover': { borderColor: '#ff9d00', bgcolor: 'rgba(255,175,27,0.04)' } }}
        >
          + Add Link
        </Button>
      </Box>

      <TextField
        fullWidth
        label="Notes"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        margin="normal"
        multiline
        rows={4}
        sx={{
          '& .MuiInputLabel-root': {
            color: '#b0b3c6',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#ffaf1b',
          },
          '& .MuiInputBase-input': {
            color: 'white',
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#31344b',
            },
            '&:hover fieldset': {
              borderColor: '#ffaf1b',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#ffaf1b',
            },
          },
        }}
      />

      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: '#ffaf1b',
            color: 'black',
            '&:hover': {
              bgcolor: '#ff9d00',
            },
          }}
        >
          {loading ? 'Updating...' : 'Update Lesson'}
        </Button>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={loading}
          sx={{
            borderColor: '#ffaf1b',
            color: '#ffaf1b',
            '&:hover': {
              borderColor: '#ff9d00',
              bgcolor: 'rgba(255, 175, 27, 0.04)',
            },
          }}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
}
