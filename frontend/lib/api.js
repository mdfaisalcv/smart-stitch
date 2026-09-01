const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

function getRefreshToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
}

export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem('access_token', access);
  if (refresh) localStorage.setItem('refresh_token', refresh);
}

export function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  const res = await fetch(`${API_URL}/auth/login/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) {
    clearTokens();
    return null;
  }
  const data = await res.json();
  setTokens({ access: data.access });
  return data.access;
}

/**
 * Thin fetch wrapper: adds the JSON content type + auth header, and retries
 * once with a refreshed access token on a 401.
 */
export async function apiFetch(path, { method = 'GET', body, auth = false, isForm = false } = {}) {
  const doFetch = async (token) => {
    const headers = {};
    if (!isForm) headers['Content-Type'] = 'application/json';
    if (auth && token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
  };

  let token = getAccessToken();
  let res = await doFetch(token);

  if (res.status === 401 && auth) {
    token = await refreshAccessToken();
    if (token) res = await doFetch(token);
  }

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : null;

  if (!res.ok) {
    const message = data?.detail || JSON.stringify(data) || res.statusText;
    throw new Error(message);
  }
  return data;
}

// ---- Auth ----
export const login = (username, password) =>
  apiFetch('/auth/login/', { method: 'POST', body: { username, password } });

export const register = (payload) =>
  apiFetch('/auth/register/', { method: 'POST', body: payload });

export const getMe = () => apiFetch('/auth/me/', { auth: true });

// ---- Catalog ----
export const getCategories = () => apiFetch('/catalog/categories/');
export const getBrands = () => apiFetch('/catalog/brands/');
export const getProducts = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/catalog/products/${qs ? `?${qs}` : ''}`);
};
export const getFeaturedProducts = () => apiFetch('/catalog/products/featured/');
export const getProduct = (slug) => apiFetch(`/catalog/products/${slug}/`);

// ---- Cart ----
export const getCart = () => apiFetch('/cart/', { auth: true });
export const addToCart = (product_id, quantity = 1, variant_id = null) =>
  apiFetch('/cart/', { method: 'POST', auth: true, body: { product_id, quantity, variant_id } });
export const updateCartItem = (itemId, quantity) =>
  apiFetch(`/cart/items/${itemId}/`, { method: 'PATCH', auth: true, body: { quantity } });
export const removeCartItem = (itemId) =>
  apiFetch(`/cart/items/${itemId}/`, { method: 'DELETE', auth: true });

// ---- Orders / Payments ----
export const checkout = (payload) =>
  apiFetch('/orders/checkout/', { method: 'POST', auth: true, body: payload });
export const getOrders = () => apiFetch('/orders/', { auth: true });
export const getOrder = (orderNumber) => apiFetch(`/orders/${orderNumber}/`, { auth: true });
export const initPayment = (order_number, method) =>
  apiFetch('/payments/init/', { method: 'POST', auth: true, body: { order_number, method } });
export const paymentCallback = (transaction_id, result) =>
  apiFetch('/payments/callback/', { method: 'POST', auth: true, body: { transaction_id, result } });
