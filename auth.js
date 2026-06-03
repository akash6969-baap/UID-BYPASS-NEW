const API_BASE = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')
    ? "http://18.234.46.149:5000"
    : ""; // Relative path on production (Vercel will proxy it via vercel.json)

// Helper to check authentication
function checkAuth() {
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('auth_role');
    const username = localStorage.getItem('auth_username');
    
    const path = window.location.pathname.toLowerCase();
    const isLoginPage = path.includes('login');
    const isResellerPage = path.includes('reseller');
    
    if (!token) {
        if (!isLoginPage) {
            window.location.href = 'login.html';
        }
        return null;
    }
    
    if (isLoginPage) {
        if (role === 'admin') {
            window.location.href = 'index.html';
        } else {
            window.location.href = 'reseller.html';
        }
        return null;
    }
    
    // Scoping check
    if (!isResellerPage && role !== 'admin') {
        window.location.href = 'reseller.html';
        return null;
    }
    if (isResellerPage && role === 'admin') {
        window.location.href = 'index.html';
        return null;
    }
    
    return { token, role, username };
}

// Wrapper for fetch requests with authorization token
async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('auth_token');
    
    options.headers = {
        ...options.headers,
    };
    
    // Do not set Content-Type header if it is not json or if body is empty / not json, but default to JSON
    if (!(options.body instanceof FormData)) {
        options.headers['Content-Type'] = 'application/json';
    }
    
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const response = await fetch(url, options);
    
    if (response.status === 401) {
        localStorage.clear();
        window.location.href = 'login.html';
        throw new Error('Unauthorized');
    }
    
    return response;
}

// Global logout function
async function logoutUser() {
    try {
        await apiFetch('/api/logout', { method: 'POST' });
    } catch (e) {
        console.error('Logout request failed: ', e);
    }
    localStorage.clear();
    window.location.href = 'login.html';
}
