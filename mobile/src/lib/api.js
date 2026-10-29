import { API_URL } from './config';

let authToken = null;

export function setAuthToken(token) {
    authToken = token;
}

export class ApiError extends Error {
    constructor(message, status, errors = {}) {
        super(message);
        this.status = status;
        this.errors = errors;
    }
}

/** Small fetch wrapper for the Laravel /api/v1 endpoints. */
export async function api(path, { method = 'GET', body, query } = {}) {
    let url = `${API_URL}/api/v1${path}`;
    if (query) {
        const qs = Object.entries(query)
            .filter(([, v]) => v !== undefined && v !== null && v !== '')
            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
            .join('&');
        if (qs) url += `?${qs}`;
    }

    let response;
    try {
        response = await fetch(url, {
            method,
            headers: {
                Accept: 'application/json',
                ...(body ? { 'Content-Type': 'application/json' } : {}),
                ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            },
            body: body ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw new ApiError('Cannot reach the server. Check your internet connection.', 0);
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const errors = data.errors ?? {};
        const first = Object.values(errors)[0]?.[0];
        throw new ApiError(first || data.message || `Request failed (${response.status})`, response.status, errors);
    }
    return data;
}
