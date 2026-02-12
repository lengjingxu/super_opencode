const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const DEFAULT_BASE_URL = 'http://8.153.201.122:3000';
const DEFAULT_TIMEOUT = 30000;

// Session 持久化路径
const SESSION_FILE = path.join(os.homedir(), '.config', 'opencode', 'hosted-session.json');

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadSession() {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      const data = fs.readFileSync(SESSION_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load session:', e);
  }
  return null;
}

function saveSession(session) {
  try {
    ensureDir(SESSION_FILE);
    fs.writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2));
  } catch (e) {
    console.error('Failed to save session:', e);
  }
}

function clearSessionFile() {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      fs.unlinkSync(SESSION_FILE);
    }
  } catch (e) {
    console.error('Failed to clear session:', e);
  }
}

class HostedServiceClient {
  constructor(baseUrl = DEFAULT_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.sessionCookie = null;
    this.accessToken = null;
    this.userId = null;
    
    // 启动时加载保存的 session
    this._loadSavedSession();
  }
  
  _loadSavedSession() {
    const session = loadSession();
    if (session) {
      this.sessionCookie = session.sessionCookie || null;
      this.userId = session.userId || null;
      this.accessToken = session.accessToken || null;
    }
  }
  
  _saveCurrentSession() {
    saveSession({
      sessionCookie: this.sessionCookie,
      userId: this.userId,
      accessToken: this.accessToken
    });
  }

  setBaseUrl(url) {
    this.baseUrl = url.replace(/\/$/, '');
  }

  setAccessToken(token) {
    this.accessToken = token;
    this._saveCurrentSession();
  }

  setSessionCookie(cookie) {
    this.sessionCookie = cookie;
    this._saveCurrentSession();
  }

  setUserId(id) {
    this.userId = id;
    this._saveCurrentSession();
  }

  clearAuth() {
    this.sessionCookie = null;
    this.accessToken = null;
    this.userId = null;
    clearSessionFile();
  }

  _request(method, path, body = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.baseUrl + path);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      if (this.accessToken) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
      }

      if (this.sessionCookie) {
        headers['Cookie'] = this.sessionCookie;
      }

      if (this.userId) {
        headers['New-Api-User'] = String(this.userId);
      }

      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method,
        headers,
        timeout: DEFAULT_TIMEOUT
      };

      const req = client.request(options, (res) => {
        let data = '';

        const setCookie = res.headers['set-cookie'];
        if (setCookie) {
          this.sessionCookie = setCookie.map(c => c.split(';')[0]).join('; ');
          this._saveCurrentSession();
        }

        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(json);
            } else {
              reject(new HostedServiceError(
                json.message || `Request failed with status ${res.statusCode}`,
                res.statusCode,
                json
              ));
            }
          } catch (e) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ raw: data });
            } else {
              reject(new HostedServiceError(
                `Request failed with status ${res.statusCode}`,
                res.statusCode,
                { raw: data }
              ));
            }
          }
        });
      });

      req.on('error', (e) => {
        reject(new HostedServiceError(
          `Network error: ${e.message}`,
          0,
          { originalError: e.message }
        ));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new HostedServiceError('Request timeout', 0, {}));
      });

      if (body) {
        req.write(JSON.stringify(body));
      }

      req.end();
    });
  }

  get(path) {
    return this._request('GET', path);
  }

  post(path, body) {
    return this._request('POST', path, body);
  }

  put(path, body) {
    return this._request('PUT', path, body);
  }

  delete(path) {
    return this._request('DELETE', path);
  }

  async register(username, password, email, verificationCode = '', affCode = '') {
    const body = { username, password, email };
    if (verificationCode) body.verification_code = verificationCode;
    if (affCode) body.aff_code = affCode;
    return this.post('/api/user/register', body);
  }

  async login(username, password) {
    const result = await this.post('/api/user/login', { username, password });
    if (result.success && result.data && result.data.id) {
      this.userId = result.data.id;
      this._saveCurrentSession();
    }
    return result;
  }

  async logout() {
    const result = await this.get('/api/user/logout');
    this.clearAuth();
    return result;
  }

  async getCurrentUser() {
    return this.get('/api/user/self');
  }

  async sendVerificationCode(email) {
    return this.get(`/api/verification?email=${encodeURIComponent(email)}`);
  }

  async getTokens(page = 1, pageSize = 20) {
    return this.get(`/api/token/?p=${page}&page_size=${pageSize}`);
  }

  async getToken(id) {
    return this.get(`/api/token/${id}`);
  }

  async createToken(name, remainQuota = 500000, unlimitedQuota = false, expiredTime = -1) {
    return this.post('/api/token/', {
      name,
      remain_quota: remainQuota,
      unlimited_quota: unlimitedQuota,
      expired_time: expiredTime
    });
  }

  async updateToken(id, data) {
    return this.put('/api/token/', { id, ...data });
  }

  async deleteToken(id) {
    return this.delete(`/api/token/${id}`);
  }

  async getTokenUsage(tokenId) {
    return this.get(`/api/usage/token?token_id=${tokenId}`);
  }

  async getAvailableModels() {
    return this.get('/api/user/models');
  }

  async getSystemStatus() {
    return this.get('/api/status');
  }

  async generateAccessToken() {
    return this.get('/api/user/token');
  }

  async getUsageLogs(page = 1, pageSize = 20) {
    return this.get(`/api/log/self?p=${page}&page_size=${pageSize}`);
  }

  async getTopupInfo() {
    return this.get('/api/user/topup/info');
  }

  async redeemCode(code) {
    return this.post('/api/user/topup', { key: code });
  }

  async getStatistics(startTime, endTime) {
    let url = '/api/data/self';
    const params = [];
    if (startTime) params.push(`start_timestamp=${startTime}`);
    if (endTime) params.push(`end_timestamp=${endTime}`);
    if (params.length > 0) url += '?' + params.join('&');
    return this.get(url);
  }

  isAuthenticated() {
    return !!(this.sessionCookie || this.accessToken);
  }
}

class HostedServiceError extends Error {
  constructor(message, statusCode, data) {
    super(message);
    this.name = 'HostedServiceError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

const defaultClient = new HostedServiceClient();

module.exports = {
  HostedServiceClient,
  HostedServiceError,
  defaultClient,
  
  setBaseUrl: (url) => defaultClient.setBaseUrl(url),
  setAccessToken: (token) => defaultClient.setAccessToken(token),
  clearAuth: () => defaultClient.clearAuth(),
  
  register: (...args) => defaultClient.register(...args),
  login: (...args) => defaultClient.login(...args),
  logout: () => defaultClient.logout(),
  getCurrentUser: () => defaultClient.getCurrentUser(),
  sendVerificationCode: (email) => defaultClient.sendVerificationCode(email),
  
  getTokens: (...args) => defaultClient.getTokens(...args),
  getToken: (id) => defaultClient.getToken(id),
  createToken: (...args) => defaultClient.createToken(...args),
  updateToken: (...args) => defaultClient.updateToken(...args),
  deleteToken: (id) => defaultClient.deleteToken(id),
  getTokenUsage: (id) => defaultClient.getTokenUsage(id),
  
  getAvailableModels: () => defaultClient.getAvailableModels(),
  getSystemStatus: () => defaultClient.getSystemStatus(),
  generateAccessToken: () => defaultClient.generateAccessToken(),
  isAuthenticated: () => defaultClient.isAuthenticated(),
  
  getUsageLogs: (...args) => defaultClient.getUsageLogs(...args),
  getTopupInfo: () => defaultClient.getTopupInfo(),
  redeemCode: (code) => defaultClient.redeemCode(code),
  getStatistics: (...args) => defaultClient.getStatistics(...args)
};
