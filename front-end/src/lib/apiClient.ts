import axios from 'axios';

const isServer = typeof window === 'undefined';
interface RefreshTokenResponse {
  accessToken: string;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://cinema-booking-system-xkgg.onrender.com",
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    if (!isServer) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url?.includes('/auth/refresh') 
    ) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await api.get<RefreshTokenResponse>('/auth/refresh'); 

        const { accessToken } = res.data;

        if (!isServer) {
            localStorage.setItem('accessToken', accessToken);
        }

        api.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
        
        processQueue(null, accessToken);
        
        originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;
        return api(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        
        if (!isServer) {
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          
          if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
             window.location.href = '/login';
          }
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;