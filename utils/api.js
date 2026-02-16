// Production URL
// export const BASE_URL = "https://firstapp.ridodrop.com";

// Local development URL for iOS Simulator (127.0.0.1 instead of localhost)
// export const BASE_URL = "http://127.0.0.1:3001";

export const BASE_URL = "http://192.168.1.2:3000";


// Alternative: localhost
// export const BASE_URL = "http://localhost:3001";

// Alternative local IP (if localhost doesn't work)
// export const BASE_URL = "http://172.20.10.3:3001";

// Android Emulator URL (10.0.2.2 maps to host machine's localhost)
// export const BASE_URL = "http://10.0.2.2:3001";

// API endpoint with version
export const API_URL = `${BASE_URL}/api/v1`;

// WebSocket URL (wss for production, ws for local)
export const WS_BASE_URL = BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://');
