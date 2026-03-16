/**
 * Arcaive — API Configuration
 *
 * In development: hits localhost:8000 (via vite proxy)
 * In production: hits the Railway deployed URL
 *
 * Set VITE_API_URL in Vercel environment variables to your Railway URL.
 */

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Helper to make authenticated API calls.
 * Automatically includes the JWT token from localStorage.
 */
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('arcaive_token');

  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (file uploads)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  return res;
}
