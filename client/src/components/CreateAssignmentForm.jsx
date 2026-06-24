import React, { useState } from 'react';
import { Box, TextField, Button, CircularProgress, MenuItem, InputLabel, Select, FormControl } from '@mui/material';
import useAllLessons from '../hooks/useAllLessons';
import useAllAssignments from '../hooks/useAllAssignments';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ImageIcon from '@mui/icons-material/Image';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';

const ORANGE = '#ffaf1b';
const CARD_BG = '#23263a';
const TEXT_COLOR = 'white';

export default function CreateAssignmentForm({ onSubmit }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    points: 0,
    lessonId: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageChange = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setUploadingImage(true);
    setError(null);
    try {
      const url = await uploadToCloudinary(selected);
      setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingImage(false);
    }
  };
  const { lessons, loading: lessonsLoading } = useAllLessons();
  const { assignments, loading: assignmentsLoading } = useAllAssignments();

  // Filter lessons to only those without an assignment
  const lessonsWithAssignment = new Set(assignments.map(a => a.lessonId?._id || a.lessonId));
  const availableLessons = lessons.filter(lesson => !lessonsWithAssignment.has(lesson._id));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${API_BASE}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create assignment');
      onSubmit(data);
      setForm({ title: '', description: '', dueDate: '', points: 0, lessonId: '', imageUrl: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, background: CARD_BG, borderRadius: 3, p: 3 }}>
      <FormControl fullWidth required sx={{ mb: 2 }}>
        <InputLabel sx={{ color: ORANGE }}>Lesson</InputLabel>
        <Select
          name="lessonId"
          value={form.lessonId}
          onChange={handleChange}
          label="Lesson"
          sx={{ color: TEXT_COLOR, '.MuiOutlinedInput-notchedOutline': { borderColor: ORANGE } }}
          disabled={lessonsLoading || assignmentsLoading}
        >
          {availableLessons.map((lesson) => (
            <MenuItem key={lesson._id} value={lesson._id}>{lesson.title}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Title"
        name="title"
        value={form.title}
        onChange={handleChange}
        required
        fullWidth
        sx={{ input: { color: TEXT_COLOR }, label: { color: ORANGE } }}
        InputLabelProps={{ style: { color: ORANGE } }}
      />
      <TextField
        label="Description"
        name="description"
        value={form.description}
        onChange={handleChange}
        required
        fullWidth
        multiline
        minRows={3}
        sx={{ textarea: { color: TEXT_COLOR }, label: { color: ORANGE } }}
        InputLabelProps={{ style: { color: ORANGE } }}
      />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Due Date"
          value={form.dueDate ? new Date(form.dueDate) : null}
          onChange={date => setForm(prev => ({ ...prev, dueDate: date ? date.toISOString().slice(0, 10) : '' }))}
          slots={{ openPickerIcon: CalendarTodayIcon }}
          slotProps={{
            openPickerIcon: { sx: { color: ORANGE } },
            textField: {
              fullWidth: true,
              InputLabelProps: { shrink: true, style: { color: ORANGE } },
              InputProps: { style: { color: TEXT_COLOR } },
              inputProps: { style: { color: TEXT_COLOR } },
              sx: {
                color: TEXT_COLOR,
                input: { color: `${TEXT_COLOR} !important` },
                '& .MuiInputBase-input': { color: `${TEXT_COLOR} !important` },
                '& .MuiOutlinedInput-input': { color: `${TEXT_COLOR} !important` },
                '& .MuiInputLabel-root': { color: ORANGE },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: ORANGE }
              }
            }
          }}
        />
      </LocalizationProvider>
      <TextField
        label="Points"
        name="points"
        type="number"
        value={form.points}
        onChange={handleChange}
        required
        fullWidth
        sx={{ input: { color: TEXT_COLOR }, label: { color: ORANGE } }}
        InputLabelProps={{ style: { color: ORANGE } }}
      />
      <Box>
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="create-assignment-image"
          type="file"
          onChange={handleImageChange}
        />
        <label htmlFor="create-assignment-image">
          <Button
            component="span"
            variant="outlined"
            startIcon={uploadingImage ? <CircularProgress size={18} sx={{ color: ORANGE }} /> : <ImageIcon />}
            sx={{ color: ORANGE, borderColor: ORANGE, textTransform: 'none', fontWeight: 600 }}
            disabled={uploadingImage}
          >
            {uploadingImage ? 'Uploading...' : (form.imageUrl ? 'Change Reference Photo' : 'Add Reference Photo (optional)')}
          </Button>
        </label>
        {form.imageUrl && (
          <Box sx={{ mt: 2 }}>
            <img src={form.imageUrl} alt="Reference" style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 8, border: '1px solid #31344b' }} />
          </Box>
        )}
      </Box>
      {error && <Box sx={{ color: 'red', mb: 1 }}>{error}</Box>}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
        <Button
          type="submit"
          variant="contained"
          sx={{ background: ORANGE, color: 'white', fontWeight: 600 }}
          disabled={loading || uploadingImage}
        >
          {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Create Assignment'}
        </Button>
      </Box>
    </Box>
  );
}
