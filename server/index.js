require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const testRoutes = require('./routes/testRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const cors = require('cors');


const app = express();
const PORT = process.env.PORT || 5000;

const origins = ['https://portal.dblshot.co', 'https://jrm-three.vercel.app', 'http://localhost:5173']; // Add your allowed origins here

app.use(express.json());
app.use(cors({
  origin: origins,
  credentials: true
}));


mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error'));

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.use('/user', userRoutes);
app.use('/lessons', lessonRoutes);
app.use('/tests', testRoutes);
app.use('/assignments', assignmentRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
