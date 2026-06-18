const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}` : 'http://nginx');

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterResponse {
  username: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  username: string;
  email: string;
  role: string;
}

export interface RefreshResponse {
  message: string;
}

export interface AuthResponse {
  accessToken: string;
  username?: string;
  email?: string;
  role?: string;
}

export const authAPI = {
  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  },

  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  },

  refresh: async (): Promise<RefreshResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return response.json();
  },

  logout: async (): Promise<void> => {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
  },

  validate: async (token: string): Promise<boolean> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/validate`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    return response.ok;
  },
};
