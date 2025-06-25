// src/services/auth.service.js
const axios = require('axios');

// Đường dẫn lấy token OAuth2
const TOKEN_URL = 'https://api.digikey.com/v1/oauth2/token';

let cachedToken = null;
let tokenExpiry = 0;

class AuthService {
  static async getAccessToken() {
    const now = Date.now() / 1000;
    if (cachedToken && now < tokenExpiry - 60) {
      return cachedToken;
    }

    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: "77pndBnY7E2w2DG2za7JZr2kPz8349BAtOUdizx3sUtJCMlP",
      client_secret: "Qpufgyrf6L4OLcIQy1h9AoH3vtkGhXbO9kjnyolTVPZjCKdsr0bgjxYTEqqzj3pj",
    });

    const resp = await axios.post(TOKEN_URL, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const { access_token, expires_in } = resp.data;
    cachedToken = access_token;
    tokenExpiry = now + expires_in;
    return access_token;
  }

  static resetToken() {
    cachedToken = null;
    tokenExpiry = 0;
  }
}

module.exports = AuthService;