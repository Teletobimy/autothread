// Backend API Configuration
export const config = {
  // Cloud Run backend URL - will be set after deployment
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
};

// API endpoints
export const api = {
  generate: `${config.backendUrl}/api/generate`,
  translate: `${config.backendUrl}/api/translate`,
  post: `${config.backendUrl}/api/post`,
  status: `${config.backendUrl}/api/status`,
};
