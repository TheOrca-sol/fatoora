const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('jwt');
}

async function request(method, url, data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
  };
  const opts = {
    method,
    headers,
  };
  if (data) {
    opts.body = JSON.stringify(data);
  }
  const res = await fetch(API_BASE + url, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || res.statusText);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (url) => request('GET', url),
  post: (url, data) => request('POST', url, data),
  put: (url, data) => request('PUT', url, data),
  patch: (url, data) => request('PATCH', url, data),
  delete: (url) => request('DELETE', url),
}; 