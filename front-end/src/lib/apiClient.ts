/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const isServer = typeof window === 'undefined';

interface RefreshTokenResponse {
    accessToken: string;
}

interface DecodedToken {
    exp: number;
    [key: string]: any;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://cinema-booking-system-xkgg.onrender.com";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

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

const handleForceLogout = () => {
    if (!isServer) {
        console.log("Force Logout triggered");
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
            window.location.href = '/login';
        }
    }
};

const handleRefreshToken = async (): Promise<string> => {
    const currentToken = !isServer ? localStorage.getItem('accessToken') : null;

    if (!currentToken) {
        throw new Error("No token available");
    }

    try {
        console.log("Calling Refresh Token API...");
        const res = await axios.post<RefreshTokenResponse>(
            `${API_URL}/auth/refresh-token`,
            {},
            {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${currentToken}`
                }
            }
        );

        const { accessToken } = res.data;
        console.log("Refresh successful, new token received.");

        if (!isServer) {
            localStorage.setItem('accessToken', accessToken);
        }

        api.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
        return accessToken;
    } catch (error) {
        console.error("Refresh failed:", error);
        handleForceLogout();
        throw error;
    }
};

api.interceptors.request.use(
    async (config: any) => {
        if (isServer) return config;

        if (config.url?.includes('/auth/')) {
            if (config.url?.includes('/auth/refresh-token')) {
                const token = localStorage.getItem('accessToken');
                if (token) config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        }

        let token = localStorage.getItem('accessToken');

        if (token) {
            try {
                const decoded: DecodedToken = jwtDecode(token);
                const currentTime = Date.now() / 1000;
                const timeBuffer = 8 * 60;

                if (decoded.exp < (currentTime + timeBuffer)) {
                    if (!isRefreshing) {
                        isRefreshing = true;
                        console.log("Token expiring soon. Attempting silent refresh...");

                        try {
                            const newToken = await handleRefreshToken();
                            processQueue(null, newToken);
                            token = newToken;
                        } catch (error) {
                            processQueue(error, null);
                            return Promise.reject(error);
                        } finally {
                            isRefreshing = false;
                        }
                    } else {
                        return new Promise((resolve, reject) => {
                            failedQueue.push({ resolve, reject });
                        }).then((newToken) => {
                            config.headers.Authorization = `Bearer ${newToken}`;
                            return config;
                        }).catch((err) => {
                            return Promise.reject(err);
                        });
                    }
                }
            } catch (error) {
                console.error("Token decode error", error);
                handleForceLogout();
            }

            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

api.interceptors.response.use(
    (response) => response,
    async (error: any) => {
        const originalRequest = error.config as any & { _retry?: boolean };
        if (!error.response || !originalRequest) return Promise.reject(error);

        if (
            (error.response.status === 401 || error.response.status === 403) &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/')
        ) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = 'Bearer ' + token;
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const accessToken = await handleRefreshToken();
                processQueue(null, accessToken);
                originalRequest.headers.Authorization = 'Bearer ' + accessToken;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

if (!isServer) {
    setInterval(async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            const decoded: DecodedToken = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            const timeUntilExpire = decoded.exp - currentTime;

            if (timeUntilExpire < 5 * 60 && !isRefreshing) {
                console.log("Auto-refresh triggered by interval (Idle check)");
                isRefreshing = true;
                try {
                    await handleRefreshToken();
                } catch (error) {
                    console.error("Auto-refresh failed", error);
                } finally {
                    isRefreshing = false;
                }
            }
        } catch (error) {
            console.error("Error in auto-refresh interval", error);
        }
    }, 60 * 1000);
}

export default api;