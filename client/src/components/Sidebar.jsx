import React from 'react';
import { useNavigate } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import LessonList from './LessonList';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import useAllTests from '../hooks/useAllTests';

const CARD_BG = '#23263a';
const TEXT_COLOR = 'white';
const ORANGE = '#ffaf1b';

export default function Sidebar({ open, onClose, lessons, loading, error }) {
  const navigate = useNavigate();
  const { tests } = useAllTests();

  const handleLeaderboardClick = () => {
    navigate('/leaderboard');
    onClose();
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          background: CARD_BG,
          color: TEXT_COLOR,
          borderTopRightRadius: 18,
          borderBottomRightRadius: 18,
          boxShadow: '0 4px 32px 0 rgba(0,0,0,0.18)',
          width: { xs: 280, sm: 340 },
          p: 0,
        },
      }}
    >
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Box sx={{ 
          color: ORANGE, 
          fontSize: 22, 
          fontWeight: 700,
          textAlign: 'center'
        }}>
          Your Lessons
        </Box>
      </Box>
      <LessonList lessons={lessons} tests={tests} loading={loading} error={error} />
      <button
        onClick={handleLeaderboardClick}
        className="flex items-center gap-2 px-6 py-4 w-full text-[#ffaf1b] transition-colors border-t border-white/10 hover:cursor-pointer"
      >
        <EmojiEventsIcon className="text-[#ffaf1b]" />
        <span className="font-semibold">Leaderboard</span>
      </button>
    </Drawer>
  );
}
