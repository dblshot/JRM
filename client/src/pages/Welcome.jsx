import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '/white_logo.png';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';
import rocketSVG from '../assets/svg/rocket.svg';
import digitalMarketingSVG from '../assets/svg/digital_marketing.svg';
import bulbSVG from '../assets/svg/bulb.svg';
import useAllLessons from '../hooks/useAllLessons';
import LessonList from '../components/LessonList';

export default function Welcome() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { lessons, loading, error } = useAllLessons();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/');
    } else if (user.admin) {
      navigate('/admin');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen w-screen flex items-center justify-center relative bg-gradient-to-br from-[#0a1833] to-[#02050a] px-2 sm:px-0 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} lessons={lessons} loading={loading} error={error} />
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8 flex flex-row items-center gap-2 sm:gap-4 z-10 p-2 sm:p-0">
        <IconButton aria-label="open sidebar" onClick={() => setSidebarOpen(true)}>
          <MenuIcon fontSize="large" className="text-white" />
        </IconButton>
        <img src={logo} alt="Logo" className="h-12 w-auto sm:h-20" />
      </div>
      {/* SVGs for decoration */}
      <motion.img
        src={rocketSVG}
        alt="Rocket"
        initial={{ opacity: 0, y: 60, scale: 0.7 }}
        animate={{ opacity: 0.6, y: 0, scale: 1, rotate: [ -12, -8, -12 ], y: [0, -10, 0] }}
        transition={{
          opacity: { duration: 1.2, delay: 0.2, type: 'spring', stiffness: 60 },
          y: { duration: 1.2, delay: 0.2, type: 'spring', stiffness: 60 },
          scale: { duration: 1.2, delay: 0.2, type: 'spring', stiffness: 60 },
          rotate: { delay: 1.5, duration: 2, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' },
          y: { delay: 1.5, duration: 2, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }
        }}
        className="absolute left-2 bottom-8 sm:left-0 sm:bottom-0 w-40 sm:w-56 md:w-80 opacity-60 rotate-[-12deg] filter-orange z-0"
        draggable={false}
      />
      <motion.img
        src={digitalMarketingSVG}
        alt="Digital Marketing"
        initial={{ opacity: 0, x: 80, scale: 0.7 }}
        animate={{ opacity: 0.6, x: 0, scale: 1, rotate: [8, 12, 8], y: [0, 10, 0] }}
        transition={{
          opacity: { duration: 1.2, delay: 0.5, type: 'spring', stiffness: 60 },
          x: { duration: 1.2, delay: 0.5, type: 'spring', stiffness: 60 },
          scale: { duration: 1.2, delay: 0.5, type: 'spring', stiffness: 60 },
          rotate: { delay: 1.8, duration: 2, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' },
          y: { delay: 1.8, duration: 2, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }
        }}
        className="absolute right-2 top-20 sm:right-0 sm:top-10 w-44 sm:w-60 md:w-96 opacity-60 rotate-[8deg] filter-orange z-0"
        draggable={false}
      />
      <motion.h1
        className="text-[2.2rem] xs:text-[2.8rem] sm:text-[4rem] md:text-[6rem] font-extrabold text-center text-[#ffaf1b] drop-shadow-lg select-none font-baloo leading-tight z-10"
        style={{ fontFamily: 'Baloo 2, cursive' }}
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: [0.4, 0.2, 0.2, 1] }}
      >
        Welcome Back<br />Junior Marketeer
      </motion.h1>
      <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&display=swap" rel="stylesheet" />
    </div>
  );
}

/* Add this to the bottom of the file or in your CSS */
// .filter-orange {
//   filter: brightness(0) saturate(100%) invert(69%) sepia(99%) saturate(749%) hue-rotate(-18deg) brightness(1.05);
// }
