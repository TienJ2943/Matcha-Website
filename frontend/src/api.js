const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5500';

export function getToken() {
  return localStorage.getItem('matcha_token');
}

export function setStoredAuth(token, user) {
  localStorage.setItem('matcha_token', token);
  localStorage.setItem('matcha_user', JSON.stringify(user));
}

export function clearStoredAuth() {
  localStorage.removeItem('matcha_token');
  localStorage.removeItem('matcha_user');
}

export function getStoredUser() {
  const value = localStorage.getItem('matcha_user');
  return value ? JSON.parse(value) : null;
}

export function resolveAssetUrl(url) {
  if (!url) return '';

  // Full external URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Admin-uploaded backend images
  // Example: /uploads/171234-matcha.jpg
  if (url.startsWith('/uploads/')) {
    return `${API_BASE_URL}${url}`;
  }

  if (url.startsWith('uploads/')) {
    return `${API_BASE_URL}/${url}`;
  }

  // Frontend public images
  // Example: /images/IMG_3814.jpg
  if (url.startsWith('/images/')) {
    return url;
  }

  if (url.startsWith('images/')) {
    return `/${url}`;
  }

  // Fallback for other public files
  if (url.startsWith('/')) {
    return url;
  }

  return `/${url}`;
}

export async function apiFetch(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || 'Request failed');
  }

  return data;
}
