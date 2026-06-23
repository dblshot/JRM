import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function VideoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { videoLink, lessonTitle, notes } = location.state || {};

  // Function to extract video ID from YouTube URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Function to extract Google Drive file ID from URL
  const getDriveFileId = (url) => {
    if (!url) return null;
    const regExp = /drive\.google\.com\/file\/d\/([\w-]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  let videoPlayer = null;
  const videoId = getYouTubeVideoId(videoLink);
  const driveId = getDriveFileId(videoLink);

  if (videoId) {
    videoPlayer = (
      <iframe
        className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={lessonTitle}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  } else if (driveId) {
    videoPlayer = (
      <iframe
        src={`https://drive.google.com/file/d/${driveId}/preview`}
        width="100%"
        height="100%"
        allow="autoplay"
        className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg bg-black"
        title={lessonTitle}
      />
    );
  } else {
    videoPlayer = (
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-[#23263a] rounded-lg">
        <p className="text-white text-lg">Video not available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a1833] to-[#02050a] px-4 py-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <IconButton 
            onClick={() => navigate(-1)}
            className="text-white hover:bg-[#ffaf1b]/[0.08]"
          >
            <ArrowBackIcon className="text-[#ffaf1b]" />
          </IconButton>
          <h1 className="text-[#ffaf1b] text-2xl sm:text-3xl font-bold ml-4">
            {lessonTitle || 'Video Lesson'}
          </h1>
        </div>

        {/* Video Player */}
        <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
          {videoPlayer}
        </div>

        {/* Description */}
        <div className="mt-6 p-6 bg-[#23263a] rounded-lg shadow-lg">
          <div className="space-y-4">
            <div>
              <h3 className="text-[#ffaf1b] text-lg font-semibold mb-2">
                Lesson Notes
              </h3>
              <p className="text-white/90 whitespace-pre-wrap">
                {notes ? notes : 'No notes available for this lesson.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
