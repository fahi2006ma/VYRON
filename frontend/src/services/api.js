// API service layer for VYRON
const API_BASE = 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('vyron_access_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('vyron_access_token', token);
    } else {
      localStorage.removeItem('vyron_access_token');
    }
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = { ...this.getHeaders(), ...(options.headers || {}) };
    
    try {
      const response = await fetch(url, { ...options, headers });
      
      if (response.status === 401 && this.token) {
        // Token expired or invalid
        this.setToken(null);
        window.dispatchEvent(new CustomEvent('vyron_auth_expired'));
      }
      
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const errorMsg = data.detail || (data[Object.keys(data)[0]]?.[0]) || 'Request failed';
        throw new Error(errorMsg);
      }
      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  }

  // Auth
  async login(credentials) {
    const data = await this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    if (data.access) this.setToken(data.access);
    return data;
  }

  async register(userData) {
    const data = await this.request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (data.access) this.setToken(data.access);
    return data;
  }

  async logout() {
    const refreshToken = localStorage.getItem('vyron_refresh_token');
    try {
      await this.request('/auth/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh: refreshToken })
      });
    } catch (e) {
      // Ignore logout errors
    }
    this.setToken(null);
    localStorage.removeItem('vyron_refresh_token');
  }

  async getProfile() {
    return this.request('/profile/');
  }

  async updateProfile(updates) {
    return this.request('/profile/', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
    });
  }

  // Missions
  async getMissions(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/missions/?${params.toString()}`);
  }

  async createMission(missionData) {
    return this.request('/missions/', {
      method: 'POST',
      body: JSON.stringify(missionData)
    });
  }

  async updateMission(id, updates) {
    return this.request(`/missions/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteMission(id) {
    return this.request(`/missions/${id}/`, {
      method: 'DELETE'
    });
  }

  async completeMission(id) {
    return this.request(`/missions/${id}/complete/`, {
      method: 'POST'
    });
  }

  // City
  async getCity() {
    return this.request('/city/');
  }

  async constructBuilding(buildingId, posX = 0, posY = 0) {
    return this.request('/city/build/', {
      method: 'POST',
      body: JSON.stringify({ building_id: buildingId, pos_x: posX, pos_y: posY })
    });
  }

  // Analytics
  async getAnalytics(range = 'week') {
    return this.request(`/analytics/?range=${range}`);
  }

  // Achievements
  async getAchievements() {
    return this.request('/achievements/');
  }

  // Leaderboard
  async getLeaderboard() {
    return this.request('/leaderboard/');
  }

  // AI Assistant (uses .env API Key securely through backend)
  async getAISuggestions(goal, category) {
    return this.request('/ai/suggest/', {
      method: 'POST',
      body: JSON.stringify({ goal, category })
    });
  }

  async getAICoaching() {
    return this.request('/ai/coach/', {
      method: 'POST'
    });
  }

  // Seed Data
  async seedData() {
    return this.request('/seed/', {
      method: 'POST'
    });
  }
}

export const api = new ApiService();
