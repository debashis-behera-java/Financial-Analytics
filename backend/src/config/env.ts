import 'dotenv/config';

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 5000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  mongoUri:
    process.env.MONGODB_URI ??
    process.env.MONGO_URI ??
    'mongodb://localhost:27017/financial_analytics',
  jwtSecret: requireEnv('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  demoUserEmail: process.env.DEMO_USER_EMAIL ?? 'demo@example.com',
  demoUserPassword: process.env.DEMO_USER_PASSWORD,
  demoUserRole: process.env.DEMO_USER_ROLE ?? 'admin',
};

export { requireEnv };
