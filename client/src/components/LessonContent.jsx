import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Collapse, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SlidesIcon from '@mui/icons-material/Animation';
import QuizIcon from '@mui/icons-material/Quiz';
import ArticleIcon from '@mui/icons-material/Article';
import VideoIcon from '@mui/icons-material/OndemandVideo';

const ORANGE = '#ffaf1b';

export default function LessonContent({ lesson, test, assignment, isExpanded, onToggle }) {
  const navigate = useNavigate();

  const handleVideoClick = (e) => {
    e.preventDefault();
    if (lesson.videoLink) {
      navigate('/video', { 
        state: { 
          videoLink: lesson.videoLink,
          lessonTitle: lesson.title,
          notes: lesson.notes
        }
      });
    }
  };

  const handleTestClick = (e) => {
    e.preventDefault();
    if (test) {
      navigate(`/test/${test._id}`);
    }
  };

  const handleAssignmentClick = (e) => {
    e.preventDefault();
    if (assignment) {
      navigate('/assignment', { state: { assignment } });
    }
  };

  return (
    <div className="w-full">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer text-white font-semibold text-lg rounded-lg"
        onClick={onToggle}
      >
        <span>{lesson.title}</span>
        <IconButton size="small" sx={{ color: ORANGE }}>
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </div>
      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <div className="flex flex-row items-stretch pl-6 pr-2 py-2 min-h-[80px]">
          {/* Vertical line with orange accent */}
          <div className="relative w-8 flex flex-col items-center mr-2">
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 rounded bg-[#ffaf1b]">
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {/* Video */}
            {lesson.videoLink ? (
              <button
                onClick={handleVideoClick}
                className="text-left text-[#ffaf1b] font-semibold text-base hover:text-[#ff9900] transition-colors hover:cursor-pointer flex items-center gap-2"
              >
                <VideoIcon sx={{ fontSize: 16 }} />
                Video
              </button>
            ) : (
              <span className="text-[#888ca3] font-semibold text-base opacity-50 cursor-not-allowed flex items-center gap-2">
                <VideoIcon sx={{ fontSize: 16 }} />
                Video
              </span>
            )}
            {/* Slides */}
            {lesson.slidesLink ? (
              <a
                href={lesson.slidesLink}
                target="_blank"
                className="text-left text-[#ffaf1b] font-semibold text-base hover:text-[#ff9900] transition-colors flex items-center gap-2"
              >
                <SlidesIcon sx={{ fontSize: 16 }} />
                Slides
              </a>
            ) : (
              <span className="text-[#888ca3] font-semibold text-base opacity-50 cursor-not-allowed flex items-center gap-2">
                <SlidesIcon sx={{ fontSize: 16 }} />
                Slides
              </span>
            )}
            {/* Test Yourself */}
            {test ? (
              <button
                onClick={handleTestClick}
                className="text-left text-[#ffaf1b] font-semibold text-base hover:text-[#ff9900] transition-colors hover:cursor-pointer flex items-center gap-2"
              >
                <QuizIcon sx={{ fontSize: 16 }} />
                Test Yourself
              </button>
            ) : (
              <span className="text-[#888ca3] font-semibold text-base opacity-50 cursor-not-allowed flex items-center gap-2">
                <QuizIcon sx={{ fontSize: 16 }} />
                Test Yourself
              </span>
            )}
            {/* Assignment */}
            {assignment ? (
              <button
                onClick={handleAssignmentClick}
                className="text-left text-[#ffaf1b] font-semibold text-base hover:text-[#ff9900] transition-colors hover:cursor-pointer flex items-center gap-2"
              >
                <ArticleIcon sx={{ fontSize: 16 }} />
                Upload Assignment
              </button>
            ) : (
              <span className="text-[#888ca3] font-semibold text-base opacity-50 cursor-not-allowed flex items-center gap-2">
                <ArticleIcon sx={{ fontSize: 16 }} />
                Upload Assignment
              </span>
            )}
          </div>
        </div>
      </Collapse>
    </div>
  );
}
