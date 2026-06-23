import React, { useState, useEffect } from 'react';
import { Alert, CircularProgress, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import useAllLessons from '../hooks/useAllLessons';
import useAllTests from '../hooks/useAllTests';

const ORANGE = '#ffaf1b';
const DARK_BG = '#181a20';
const CARD_BG = '#23263a';
const LABEL_COLOR = ORANGE;
const PLACEHOLDER_COLOR = '#b0b3c6';

export default function CreateTestForm({ onSubmit }) {
  const { lessons } = useAllLessons();
  const { tests } = useAllTests();
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [timeLimit, setTimeLimit] = useState(120);
  const [questions, setQuestions] = useState([
    {
      text: '',
      choices: ['', ''],
      correctAnswer: 0,
      difficulty: 'easy',
      basePoints: 5
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Filter out lessons that already have tests
  const availableLessons = lessons.filter(lesson => {
    const lessonHasTest = tests.some(test => 
      test.lessonId?._id === lesson._id || test.lessonId === lesson._id
    );
    return !lessonHasTest;
  });

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        choices: ['', ''],
        correctAnswer: 0,
        difficulty: 'easy',
        basePoints: 5
      }
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const addChoice = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].choices.push('');
    setQuestions(updatedQuestions);
  };

  const removeChoice = (questionIndex, choiceIndex) => {
    const updatedQuestions = [...questions];
    const choices = updatedQuestions[questionIndex].choices;
    if (choices.length > 2) {
      choices.splice(choiceIndex, 1);
      // Adjust correctAnswer if necessary
      if (updatedQuestions[questionIndex].correctAnswer >= choiceIndex) {
        updatedQuestions[questionIndex].correctAnswer = Math.max(0, updatedQuestions[questionIndex].correctAnswer - 1);
      }
      setQuestions(updatedQuestions);
    }
  };

  const updateChoice = (questionIndex, choiceIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].choices[choiceIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validate form
    if (!selectedLessonId) {
      setError('Please select a lesson');
      setLoading(false);
      return;
    }

    if (questions.some(q => !q.text.trim())) {
      setError('All questions must have text');
      setLoading(false);
      return;
    }

    if (questions.some(q => q.choices.some(c => !c.trim()))) {
      setError('All choices must have text');
      setLoading(false);
      return;
    }

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${API_BASE}/tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: selectedLessonId,
          questions,
          timeLimit: parseInt(timeLimit)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create test');
      
      setSuccess(true);
      setSelectedLessonId('');
      setTimeLimit(120);
      setQuestions([{
        text: '',
        choices: ['', ''],
        correctAnswer: 0,
        difficulty: 'easy',
        basePoints: 5
      }]);
      if (onSubmit) onSubmit(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: CARD_BG, borderRadius: 16, maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem', boxShadow: '0 4px 32px 0 rgba(0,0,0,0.18)' }}>
      <h2 style={{ color: ORANGE, fontWeight: 700, fontSize: 24, marginBottom: 4, textAlign: 'center' }}>Create Test</h2>
      <p style={{ color: PLACEHOLDER_COLOR, fontSize: 15, marginBottom: 24, textAlign: 'center' }}>
        Create a new test for a lesson with multiple choice questions.
      </p>
      
      <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Lesson Selection */}
        <div style={{ marginBottom: 10 }}>
          <label htmlFor="lesson" style={{ color: LABEL_COLOR, fontWeight: 600, fontSize: 15, marginBottom: 6, display: 'block' }}>Select Lesson *</label>
          <select
            id="lesson"
            value={selectedLessonId}
            onChange={e => setSelectedLessonId(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 8,
              background: DARK_BG,
              border: '1.5px solid #31344b',
              color: 'white',
              fontSize: 16,
              outline: 'none',
              marginTop: 2,
              marginBottom: 0,
              transition: 'border 0.2s',
            }}
            onFocus={e => (e.target.style.border = `1.5px solid ${ORANGE}`)}
            onBlur={e => (e.target.style.border = '1.5px solid #31344b')}
          >
            <option value="">Select a lesson...</option>
            {availableLessons.map(lesson => (
              <option key={lesson._id} value={lesson._id}>{lesson.title}</option>
            ))}
          </select>
          {availableLessons.length === 0 && (
            <p style={{ color: '#ff6b6b', fontSize: 14, marginTop: 8 }}>
              All lessons already have tests. Create a new lesson first.
            </p>
          )}
        </div>

        {/* Time Limit */}
        <div style={{ marginBottom: 10 }}>
          <label htmlFor="timeLimit" style={{ color: LABEL_COLOR, fontWeight: 600, fontSize: 15, marginBottom: 6, display: 'block' }}>Time Limit (seconds)</label>
          <input
            id="timeLimit"
            type="number"
            min="30"
            max="3600"
            value={timeLimit}
            onChange={e => setTimeLimit(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 8,
              background: DARK_BG,
              border: '1.5px solid #31344b',
              color: 'white',
              fontSize: 16,
              outline: 'none',
              marginTop: 2,
              marginBottom: 0,
              transition: 'border 0.2s',
            }}
            onFocus={e => (e.target.style.border = `1.5px solid ${ORANGE}`)}
            onBlur={e => (e.target.style.border = '1.5px solid #31344b')}
          />
        </div>

        {/* Questions */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <label style={{ color: LABEL_COLOR, fontWeight: 600, fontSize: 15 }}>Questions</label>
            <IconButton
              onClick={addQuestion}
              sx={{ 
                color: ORANGE, 
                background: 'rgba(255,175,27,0.1)',
                '&:hover': { background: 'rgba(255,175,27,0.2)' }
              }}
            >
              <AddIcon />
            </IconButton>
          </div>
          
          {questions.map((question, questionIndex) => (
            <div key={questionIndex} style={{ 
              background: DARK_BG, 
              borderRadius: 12, 
              padding: 20, 
              marginBottom: 16,
              border: '1px solid #31344b'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 style={{ color: ORANGE, margin: 0 }}>Question {questionIndex + 1}</h4>
                {questions.length > 1 && (
                  <IconButton
                    onClick={() => removeQuestion(questionIndex)}
                    sx={{ color: '#ff6b6b' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </div>

              {/* Question Text */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ color: LABEL_COLOR, fontWeight: 600, fontSize: 14, marginBottom: 4, display: 'block' }}>Question Text *</label>
                <textarea
                  value={question.text}
                  onChange={e => updateQuestion(questionIndex, 'text', e.target.value)}
                  placeholder="Enter the question..."
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 6,
                    background: CARD_BG,
                    border: '1px solid #31344b',
                    color: 'white',
                    fontSize: 14,
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: 60,
                  }}
                />
              </div>

              {/* Choices */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ color: LABEL_COLOR, fontWeight: 600, fontSize: 14 }}>Choices</label>
                  <IconButton
                    onClick={() => addChoice(questionIndex)}
                    sx={{ 
                      color: ORANGE, 
                      background: 'rgba(255,175,27,0.1)',
                      '&:hover': { background: 'rgba(255,175,27,0.2)' },
                      fontSize: 12
                    }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </div>
                
                {question.choices.map((choice, choiceIndex) => (
                  <div key={choiceIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <input
                      type="radio"
                      name={`correct-${questionIndex}`}
                      checked={question.correctAnswer === choiceIndex}
                      onChange={() => updateQuestion(questionIndex, 'correctAnswer', choiceIndex)}
                      style={{ marginRight: 8, accentColor: ORANGE }}
                    />
                    <input
                      type="text"
                      value={choice}
                      onChange={e => updateChoice(questionIndex, choiceIndex, e.target.value)}
                      placeholder={`Choice ${choiceIndex + 1}`}
                      required
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        borderRadius: 4,
                        background: CARD_BG,
                        border: '1px solid #31344b',
                        color: 'white',
                        fontSize: 14,
                        outline: 'none',
                      }}
                    />
                    {question.choices.length > 2 && (
                      <IconButton
                        onClick={() => removeChoice(questionIndex, choiceIndex)}
                        sx={{ color: '#ff6b6b', ml: 1 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </div>
                ))}
              </div>

              {/* Difficulty and Points */}
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ color: LABEL_COLOR, fontWeight: 600, fontSize: 14, marginBottom: 4, display: 'block' }}>Difficulty</label>
                  <select
                    value={question.difficulty}
                    onChange={e => updateQuestion(questionIndex, 'difficulty', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 4,
                      background: CARD_BG,
                      border: '1px solid #31344b',
                      color: 'white',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ color: LABEL_COLOR, fontWeight: 600, fontSize: 14, marginBottom: 4, display: 'block' }}>Base Points</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={question.basePoints}
                    onChange={e => updateQuestion(questionIndex, 'basePoints', parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 4,
                      background: CARD_BG,
                      border: '1px solid #31344b',
                      color: 'white',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 8,
            background: ORANGE,
            color: CARD_BG,
            fontWeight: 'bold',
            fontSize: 18,
            marginTop: 12,
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'background 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
          disabled={loading || availableLessons.length === 0}
        >
          {loading && <CircularProgress size={22} sx={{ color: CARD_BG }} />}
          {loading ? 'Creating...' : 'Create Test'}
        </button>
        
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>Test created successfully!</Alert>}
      </form>
    </div>
  );
}
