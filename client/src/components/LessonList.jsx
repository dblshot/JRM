import React, { useState } from 'react';
import { CircularProgress } from '@mui/material';
import LessonContent from './LessonContent';
import useAllAssignments, { getAssignmentForLesson } from '../hooks/useAllAssignments';

const ORANGE = '#ffaf1b';

export default function LessonList({ lessons, tests, loading, error }) {
  const [expandedLessonId, setExpandedLessonId] = useState(null);
  const { assignments, loading: assignmentsLoading } = useAllAssignments();

  const handleExpand = (lessonId) => {
    setExpandedLessonId(expandedLessonId === lessonId ? null : lessonId);
  };

  // Helper function to get test for a lesson
  const getTestForLesson = (lessonId) => {
    return tests?.find(test => test.lessonId?._id === lessonId || test.lessonId === lessonId);
  };

  if (loading || assignmentsLoading) {
    return (
      <div className="flex justify-center p-4">
        <CircularProgress sx={{ color: ORANGE }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 p-2 text-center">
        Failed to load lessons
      </div>
    );
  }

  return (
    <div className="py-2">
      {lessons.map((lesson) => {
        const lessonTest = getTestForLesson(lesson._id);
        const lessonAssignment = getAssignmentForLesson(assignments, lesson._id);
        return (
          <LessonContent 
            key={lesson._id} 
            lesson={lesson}
            test={lessonTest}
            assignment={lessonAssignment}
            isExpanded={expandedLessonId === lesson._id}
            onToggle={() => handleExpand(lesson._id)}
          />
        );
      })}
    </div>
  );
}
