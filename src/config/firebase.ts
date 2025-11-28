const requireEnv = (value: string | undefined, name: string) => {
  if (!value) {
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
