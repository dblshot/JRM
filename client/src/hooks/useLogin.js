import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      
      const res = await fetch(`${API_BASE}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      let data = null;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      }
      if (!res.ok) throw new Error((data && data.message) || 'Login failed');
      if (!data) throw new Error('No data received from server');
      localStorage.setItem('token', data.token);
      setUser({ username: data.username, admin: data.admin, _id: data._id });
      setLoading(false);
      return { username: data.username, admin: data.admin, _id: data._id };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      setUser(null);
      return null;
    }
  };

  return { login, loading, error, user };
}
