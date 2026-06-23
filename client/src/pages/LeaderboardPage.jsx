import React from 'react';
import { useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Leaderboard from '../components/Leaderboard';
import { useWindowSize } from 'react-use'
import Confetti from 'react-confetti'

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const { width, height } = useWindowSize()

  return (
    <>
    <Confetti
      width={width}
      height={height}
    />
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a1833] to-[#02050a] px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <IconButton 
            onClick={() => navigate(-1)}
            className="text-white hover:bg-[#ffaf1b]/[0.08]"
          >
            <ArrowBackIcon className="text-[#ffaf1b]" />
          </IconButton>
        </div>
        <Leaderboard />
      </div>
    </div>
    </>
  );
}
