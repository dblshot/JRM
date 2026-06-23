import { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function useTestCompletion(testId, userId) {
  const [hasCompleted, setHasCompleted] = useState(false);
  const [completedTest, setCompletedTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkCompletion = useCallback(async () => {
    if (!testId || !userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/tests/${testId}/completion-status/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to check test completion status');
      }
      const data = await response.json();
      setHasCompleted(data.hasCompleted);
      setCompletedTest(data.completedTest);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [testId, userId]);

  useEffect(() => {
    checkCompletion();
  }, [checkCompletion]);

  return { hasCompleted, completedTest, loading, error, refetch: checkCompletion };
}
