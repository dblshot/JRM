import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Welcome from './pages/Welcome';
import Admin from './pages/Admin';
import VideoPage from './pages/VideoPage';
import LeaderboardPage from './pages/LeaderboardPage';
import PDFPage from './pages/PDFPage';
import TestEditPage from './pages/TestEditPage';
import TestTakingPage from './pages/TestTakingPage';
import AssignmentPage from './pages/AssignmentPage';
import AssignmentEditPage from './pages/AssignmentEditPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/video" element={<VideoPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/pdf" element={<PDFPage />} />
        <Route path="/admin/tests" element={<TestEditPage />} />
        <Route path="/test/:testId" element={<TestTakingPage />} />
        <Route path="/assignment" element={<AssignmentPage />} />
        <Route path="/admin/assignments" element={<AssignmentEditPage />} />
      </Routes>
    </Router>
  );
}

export default App;
