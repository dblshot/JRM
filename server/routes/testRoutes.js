const express = require('express');
const router = express.Router();
const Quiz = require('../schemas/Test');
const Lesson = require('../schemas/Lesson');
const User = require('../schemas/User');

// Route 1: Create a new test/quiz
router.post('/', async (req, res) => {
  const { lessonId, questions, timeLimit } = req.body;
  
  if (!lessonId || !questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ 
      message: 'Lesson ID and questions array are required. Questions must be a non-empty array.' 
    });
  }

  // Validate that the lesson exists
  try {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
  } catch (err) {
    return res.status(400).json({ message: 'Invalid lesson ID' });
  }

  // Validate questions structure
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    if (!question.text || !Array.isArray(question.choices) || question.choices.length < 2) {
      return res.status(400).json({ 
        message: `Question ${i + 1}: Text and at least 2 choices are required` 
      });
    }
    if (typeof question.correctAnswer !== 'number' || 
        question.correctAnswer < 0 || 
        question.correctAnswer >= question.choices.length) {
      return res.status(400).json({ 
        message: `Question ${i + 1}: Correct answer must be a valid index within choices array` 
      });
    }
  }

  try {
    const quiz = new Quiz({ 
      lessonId, 
      questions, 
      timeLimit: timeLimit || 120 
    });
    await quiz.save();
    res.status(201).json({ message: 'Test created successfully', quiz });
  } catch (err) {
    res.status(500).json({ message: 'Error creating test', error: err.message });
  }
});

// Route 2: Get all tests
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find({}).populate('lessonId', 'title');
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tests', error: err.message });
  }
});

// Route 3: Get test by ID (for taking the test)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const quiz = await Quiz.findById(id).populate('lessonId', 'title');
    if (!quiz) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    // Return test without correct answers for security
    const testForUser = {
      _id: quiz._id,
      lessonId: quiz.lessonId,
      timeLimit: quiz.timeLimit,
      questions: quiz.questions.map(q => ({
        text: q.text,
        choices: q.choices,
        difficulty: q.difficulty,
        basePoints: q.basePoints
      }))
    };
    
    res.json(testForUser);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching test', error: err.message });
  }
});

// Route 4: Get tests by lesson ID
router.get('/lesson/:lessonId', async (req, res) => {
  const { lessonId } = req.params;
  try {
    const quizzes = await Quiz.find({ lessonId }).populate('lessonId', 'title');
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tests for lesson', error: err.message });
  }
});

// Route 5: Check if user has completed a test
router.get('/:testId/completion-status/:userId', async (req, res) => {
  const { testId, userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const completedTest = user.completedTests.find(test => test.testId.toString() === testId);
    const hasCompleted = !!completedTest;
    let feedback = null;
    let timeBonusApplied = false;
    let timeTaken = undefined;
    let timeLimit = undefined;
    if (hasCompleted) {
      // Fetch the test to get questions/choices/correct answers
      const quiz = await Quiz.findById(testId);
      if (quiz) {
        timeLimit = quiz.timeLimit;
        feedback = quiz.questions.map((question, i) => {
          const userAnswer = completedTest.userAnswers.find(a => a.questionIndex === i);
          const isCorrect = userAnswer && userAnswer.selectedAnswer === question.correctAnswer;
          return {
            questionIndex: i,
            isCorrect,
            correctAnswer: question.correctAnswer,
            selectedAnswer: userAnswer ? userAnswer.selectedAnswer : null,
            pointsEarned: isCorrect ? question.basePoints : 0,
            text: question.text,
            choices: question.choices
          };
        });
        // Use stored timeTaken and timeBonusApplied if present
        timeTaken = completedTest.timeTaken;
        if (typeof completedTest.timeBonusApplied === 'boolean') {
          timeBonusApplied = completedTest.timeBonusApplied;
        } else if (typeof timeTaken === 'number' && typeof timeLimit === 'number') {
          // Fallback: recompute if not stored (for backward compatibility)
          timeBonusApplied = timeTaken <= timeLimit;
        }
      }
    }
    res.json({
      hasCompleted,
      completedTest: hasCompleted ? {
        ...completedTest.toObject ? completedTest.toObject() : completedTest,
        feedback,
        timeBonusApplied,
        timeTaken,
        timeLimit
      } : null
    });
  } catch (err) {
    res.status(500).json({ message: 'Error checking completion status', error: err.message });
  }
});

// Route 6: Submit test results
router.post('/:testId/submit', async (req, res) => {
  const { testId } = req.params;
  const { userId, answers, timeTaken } = req.body;
  
  if (!userId || !answers || !Array.isArray(answers)) {
    return res.status(400).json({ 
      message: 'User ID and answers array are required' 
    });
  }

  try {
    // Get the test
    const test = await Quiz.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Check if user has already completed this test
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hasCompleted = user.completedTests.some(completedTest => 
      completedTest.testId.toString() === testId
    );
    
    if (hasCompleted) {
      return res.status(400).json({ message: 'Test already completed' });
    }

    // Calculate score and feedback
    let totalScore = 0;
    const feedback = [];
    const answersArray = [];
    for (let i = 0; i < test.questions.length; i++) {
      const question = test.questions[i];
      const userAnswer = answers.find(a => a.questionIndex === i);
      const isCorrect = userAnswer && userAnswer.selectedAnswer === question.correctAnswer;
      let pointsEarned = isCorrect ? question.basePoints : 0;
      totalScore += pointsEarned;
      feedback.push({
        questionIndex: i,
        isCorrect,
        correctAnswer: question.correctAnswer,
        selectedAnswer: userAnswer ? userAnswer.selectedAnswer : null,
        pointsEarned,
        text: question.text,
        choices: question.choices
      });
      answersArray.push({
        questionIndex: i,
        selectedAnswer: userAnswer ? userAnswer.selectedAnswer : null
      });
    }

    // Apply time bonus if finished within the time limit
    let timeBonusApplied = false;
    if (typeof timeTaken === 'number' && timeTaken <= test.timeLimit) {
      totalScore = totalScore * 2;
      timeBonusApplied = true;
    }

    // Save completed test to user (only testId, lessonId, score)
    const completedTest = {
      testId: test._id,
      lessonId: test.lessonId,
      score: totalScore,
      userAnswers: answersArray,
      timeTaken: typeof timeTaken === 'number' ? timeTaken : undefined,
      timeBonusApplied
    };
    user.completedTests.push(completedTest);
    user.score += totalScore; // Add to total score
    await user.save();

    res.json({
      message: 'Test submitted successfully',
      result: {
        score: totalScore,
        feedback,
        timeBonusApplied,
        timeTaken: typeof timeTaken === 'number' ? timeTaken : undefined,
        timeLimit: test.timeLimit
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting test', error: err.message });
  }
});

// Route 7: Delete a test by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const quiz = await Quiz.findByIdAndDelete(id);
    if (!quiz) {
      return res.status(404).json({ message: 'Test not found' });
    }
    res.json({ message: 'Test deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting test', error: err.message });
  }
});

// Route 8: Update a test by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { lessonId, questions, timeLimit } = req.body;
  
  try {
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // If lessonId is being updated, validate it exists
    if (lessonId && lessonId !== quiz.lessonId.toString()) {
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        return res.status(404).json({ message: 'Lesson not found' });
      }
      quiz.lessonId = lessonId;
    }

    // If questions are being updated, validate them
    if (questions && Array.isArray(questions)) {
      if (questions.length === 0) {
        return res.status(400).json({ message: 'Questions array cannot be empty' });
      }

      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        if (!question.text || !Array.isArray(question.choices) || question.choices.length < 2) {
          return res.status(400).json({ 
            message: `Question ${i + 1}: Text and at least 2 choices are required` 
          });
        }
        if (typeof question.correctAnswer !== 'number' || 
            question.correctAnswer < 0 || 
            question.correctAnswer >= question.choices.length) {
          return res.status(400).json({ 
            message: `Question ${i + 1}: Correct answer must be a valid index within choices array` 
          });
        }
      }
      quiz.questions = questions;
    }

    // Update timeLimit if provided
    if (timeLimit !== undefined) {
      quiz.timeLimit = timeLimit;
    }

    await quiz.save();
    res.json({ message: 'Test updated successfully', quiz });
  } catch (err) {
    res.status(500).json({ message: 'Error updating test', error: err.message });
  }
});

module.exports = router;
