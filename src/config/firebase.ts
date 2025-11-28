const requireEnv = (value: string | undefined, name: string) => {
  if (!value) {
    console.error(`Missing environment variable: ${name}`);
    // In production, show a user-friendly error instead of crashing
    if (import.meta.env.PROD) {
      const errorMsg = `Configuration Error: Missing ${name}. Please check your environment variables.`;
      document.body.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif; background: #f5f5f5;">
          <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; text-align: center;">
            <h2 style="color: #e74c3c; margin-bottom: 1rem;">⚠️ Configuration Error</h2>
            <p style="color: #333; margin-bottom: 1rem;">${errorMsg}</p>
            <p style="color: #666; font-size: 0.9rem;">Please contact the administrator or check the console for details.</p>
          </div>
        </div>
      `;
    }
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
};

const {
  VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID,
  VITE_FIREBASE_MEASUREMENT_ID,
  VITE_API_URL
} = import.meta.env;

// Firebase configuration (values must be supplied via Vite env vars)
export const firebaseConfig = {
  apiKey: requireEnv(VITE_FIREBASE_API_KEY, 'VITE_FIREBASE_API_KEY'),
  authDomain: requireEnv(VITE_FIREBASE_AUTH_DOMAIN, 'VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: requireEnv(VITE_FIREBASE_PROJECT_ID, 'VITE_FIREBASE_PROJECT_ID'),
  storageBucket: requireEnv(VITE_FIREBASE_STORAGE_BUCKET, 'VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: requireEnv(VITE_FIREBASE_MESSAGING_SENDER_ID, 'VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: requireEnv(VITE_FIREBASE_APP_ID, 'VITE_FIREBASE_APP_ID'),
  measurementId: VITE_FIREBASE_MEASUREMENT_ID
};

// API Base URL - enforce explicit value for production builds
export const API_BASE_URL = (() => {
  if (import.meta.env.DEV) {
    return VITE_API_URL ?? '/api';
  }

  const apiUrl = requireEnv(VITE_API_URL, 'VITE_API_URL');
  return apiUrl;
})();
