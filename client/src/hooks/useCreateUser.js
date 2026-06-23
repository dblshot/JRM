import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function useCreateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const createUser = async ({ fullName, username, password }) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`${API_BASE}/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: fullName, username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create user');
      setSuccess(true);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      setSuccess(false);
      return null;
    }
  };

  return { createUser, loading, error, success };
}
