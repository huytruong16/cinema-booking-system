export default () => ({
    redis: {
        host: process.env.REDIS_HOST,
        user: process.env.REDIS_USER,
        password: process.env.REDIS_PASSWORD,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        accessTokenExpire: process.env.JWT_ACCESS_EXPIRE || '15m',
        refreshTokenExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
    },
    cors: {
        allowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || '')
            .split(',')
            .filter(Boolean),
    },
});
