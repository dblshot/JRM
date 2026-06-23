import { useEffect, useState } from 'react';

export default function useAssignmentSubmissions(assignmentId) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!assignmentId) return;
    const API_BASE = import.meta.env.VITE_API_BASE_URL;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/assignments/${assignmentId}/submissions`)
      .then(res => res.json())
      .then(data => {
        setSubmissions(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [assignmentId]);

  return { submissions, loading, error };
}
