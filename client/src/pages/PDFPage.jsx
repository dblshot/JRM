import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function PDFPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { slidesLink, lessonTitle } = location.state || {};

  // Extract Google Drive file ID and create embed link if possible
  const getGoogleDriveEmbedUrl = (url) => {
    const match = url && url.match(/\/d\/([\w-]+)\//);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return url;
  };

  const embedUrl = getGoogleDriveEmbedUrl(slidesLink);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a1833] to-[#02050a] px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <IconButton 
            onClick={() => navigate(-1)}
            className="text-white hover:bg-[#ffaf1b]/[0.08]"
          >
            <ArrowBackIcon className="text-[#ffaf1b]" />
          </IconButton>
          <h1 className="text-[#ffaf1b] text-2xl sm:text-3xl font-bold ml-4">
            {lessonTitle || 'Slides'}
          </h1>
        </div>
        {embedUrl ? (
          <div className="w-full" style={{ minHeight: '70vh' }}>
            <iframe
              src={embedUrl}
              title={lessonTitle || 'Slides'}
              width="100%"
              height="700px"
              allow="autoplay"
              className="rounded-lg shadow-lg bg-white"
            />
          </div>
        ) : (
          <div className="text-white text-lg">No slides available.</div>
        )}
      </div>
    </div>
  );
}
