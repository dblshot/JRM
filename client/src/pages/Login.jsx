import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useLogin from '../hooks/useLogin';
import logo from '/logo.png'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import tacticsSVG from '../assets/svg/tactics.svg';
import speakerSVG from '../assets/svg/Speaker.svg';
import { motion } from 'framer-motion';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error, user } = useLogin();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loggedInUser = await login(username, password);
    if (loggedInUser) {
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      if (loggedInUser.admin) {
        navigate('/admin');
      } else {
        navigate('/welcome');
      }
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-[#0a1833] to-[#02050a] px-2 relative overflow-hidden">
      {/* Speaker SVG - Left Center (reversed, slightly up) */}
      <motion.img
        src={tacticsSVG}
        alt="Speaker"
        className="hidden md:block absolute left-1/8 top-1/5 z-10 filter-orange"
        style={{ transform: 'scaleX(1)' }}
        initial={{ opacity: 0, x: -40, y: -30, rotate: -8 }}
        animate={{ opacity: 1, x: 0, y: -30, rotate: [ -8, -4, -8 ] }}
        transition={{ duration: 2.2, delay: 0.2, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        width={200}
        height={200}
      />
      {/* Tactics SVG - Right Center (slightly down) */}
      <motion.img
        src={speakerSVG}
        alt="Tactics"
        className="hidden md:block absolute right-1/8 bottom-1/8 z-10 filter-orange"
        initial={{ opacity: 0, x: 40, y: 40, rotate: 8 }}
        animate={{ opacity: 1, x: 0, y: 40, rotate: [ 8, 4, 8 ] }}
        transition={{ duration: 2.2, delay: 0.4, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        width={200}
        height={200}
      />
      {/* Mobile: Speaker above, Tactics below */}
      <motion.img
        src={speakerSVG}
        alt="Speaker"
        className="md:hidden absolute left-1/2 -translate-x-1/2 top-8 z-10 filter-orange"
        style={{ transform: 'scaleX(1)' }}
        initial={{ opacity: 0, y: -30, rotate: -8 }}
        animate={{ opacity: 1, y: -10, rotate: [ -8, -4, -8 ] }}
        transition={{ duration: 2.2, delay: 0.2, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        width={96}
        height={96}
      />
      <motion.img
        src={tacticsSVG}
        alt="Tactics"
        className="md:hidden absolute left-1/2 -translate-x-1/2 bottom-8 z-10 filter-orange"
        initial={{ opacity: 0, y: 30, rotate: 8 }}
        animate={{ opacity: 1, y: 10, rotate: [ 8, 4, 8 ] }}
        transition={{ duration: 2.2, delay: 0.4, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        width={96}
        height={96}
      />
      <div className="bg-slate-100 rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-md flex flex-col items-center">
        <div className="flex flex-col items-center w-full">
          <img src={logo} alt="Logo" />
        </div>
        <form className="w-full flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-lg font-semibold text-gray-900">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 text-lg text-gray-900 placeholder-gray-400 transition-all duration-200 shadow-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-lg font-semibold text-gray-900">
              Password
            </label>
            <div className="relative w-full">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 text-lg text-gray-900 placeholder-gray-400 transition-all duration-200 shadow-sm"
              />
              <IconButton
                onClick={() => setShowPassword((prev) => !prev)}
                className="!absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none p-1"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                size="small"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-lg font-bold bg-[#ffaf1b] text-white text-xl mt-4 shadow-md hover:bg-blue-950 cursor-pointer transition-colors duration-150"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
          {error && (
            <div className="flex items-center gap-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 relative mt-2 shadow rounded-xl text-sm sm:text-base" role="alert">
              <ErrorOutlineIcon className="text-red-700" />
              <span className="block font-medium">{error}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
