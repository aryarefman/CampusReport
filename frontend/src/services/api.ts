/* eslint-disable @typescript-eslint/no-unused-vars */
const BASE_URL = 'http://localhost:3000';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: {
      id: string;
      username: string;
      email: string;
      role: 'user' | 'admin';
    };
    token: string;
  };
}

export interface ReportStats {
  total: number;
  pending: number;
  inProgress: number;
  done: number;
}

export interface Message {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  user: {
    _id: string;
    username: string;
    email: string;
  };
  lastMessage: Message;
  unreadCount: number;
}

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = BASE_URL;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

      const token = result.data?.token;

      if (token) {
        localStorage.setItem('token', token);

        const userData = parseJwt(token);

        const user = {
          id: userData.id,
          email: userData.email,
          username: userData.username || 'User',
          role: userData.role || 'user'
        };
        localStorage.setItem('user', JSON.stringify(user));

        return {
          ...result,
          data: {
            user: user,
            token: token
          }
        };
      } else {
        throw new Error('Login response missing token');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private _getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async get(endpoint: string) {
    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'GET',
        headers: this._getAuthHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          this.logout();
          window.location.reload();
        }
        throw new Error(result.message || 'Failed to fetch data');
      }
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async getReportStats(): Promise<ReportStats> {
    const result = await this.get('reports/stats');
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch report stats');
    }
    return result.data;
  }

  async getAnalytics(scope: 'global' | 'personal' = 'global'): Promise<any> {
    const result = await this.get(`reports/analytics?scope=${scope}`);
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch analytics data');
    }
    return result.data;
  }

  async getMe(): Promise<AuthResponse> {
    const result = await this.get('auth/me');
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch user data');
    }
    return result;
  }

  // Get all conversations for admin
  async getConversations(): Promise<Conversation[]> {
    const result = await this.get('messages/conversations');
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch conversations');
    }
    return result.data;
  }

  // Get messages with a specific user
  async getMessages(userId: string): Promise<Message[]> {
    const result = await this.get(`messages/${userId}`);
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch messages');
    }
    return result.data;
  }

  // Send a message to a user
  async sendMessage(content: string, receiverId: string): Promise<Message> {
    try {
      const response = await fetch(`${this.baseUrl}/messages/send`, {
        method: 'POST',
        headers: this._getAuthHeaders(),
        body: JSON.stringify({
          content,
          receiver: receiverId
        })
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          this.logout();
          window.location.reload();
        }
        throw new Error(result.message || 'Failed to send message');
      }

      if (!result.success) {
        throw new Error(result.message || 'Failed to send message');
      }

      return result.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }
}

export const apiService = new ApiService();