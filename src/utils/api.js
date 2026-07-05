const BASE_URL = 'http://localhost:8000/api';

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('inventory_token');
  
  const defaultHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Handle FormData separately as it shouldn't have Content-Type explicitly set
  if (options.body instanceof FormData) {
    delete defaultHeaders['Content-Type'];
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('inventory_token');
      localStorage.removeItem('inventory_user');
      window.location.href = '/login';
    }
    
    const errorData = await response.json().catch(() => ({ message: 'Server Error' }));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return await response.json();
};
