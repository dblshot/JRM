import { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function useTestsByLesson(lessonId) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTests = useCallback(async () => {
    if (!lessonId) {
      setTests([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/tests/lesson/${lessonId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tests for lesson');
      }
      const data = await response.json();
      setTests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  return { tests, loading, error, refetch: fetchTests };
}
