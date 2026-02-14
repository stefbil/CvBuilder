const API_BASE = import.meta.env.VITE_API_URL || '';

export async function apiFetch(url, options = {}) {
    const token = localStorage.getItem('token');

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${url}`, config);

    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Session expired');
    }

    return response;
}

export async function getResume(id) {
    const res = await apiFetch(`/api/resumes/${id}`);
    if (!res.ok) throw new Error('Resume not found');
    return res.json();
}

export async function saveResume(id, data) {
    const res = await apiFetch(`/api/resumes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save resume');
    return res.json();
}
