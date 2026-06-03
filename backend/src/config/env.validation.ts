interface EnvironmentVariables {
  DATABASE_URL: string;
  PORT: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  CORS_ORIGIN: string;
}

const defaults: Omit<EnvironmentVariables, 'DATABASE_URL'> = {
  PORT: '4000',
  JWT_SECRET: 'dev-access-secret',
  JWT_REFRESH_SECRET: 'dev-refresh-secret',
  JWT_EXPIRES_IN: '15m',
  JWT_REFRESH_EXPIRES_IN: '7d',
  CORS_ORIGIN: 'http://localhost:3000',
};

function assertDatabaseUrl(value: string | undefined): string {
  if (!value) {
    throw new Error('DATABASE_URL is required');
  }

  if (!value.startsWith('postgresql://') && !value.startsWith('postgres://')) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection string');
  }

  return value;
}

function assertPort(value: string): string {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  return value;
}

export function validateEnv(
  config: Record<string, string | undefined>,
): EnvironmentVariables {
  const env: EnvironmentVariables = {
    DATABASE_URL: assertDatabaseUrl(config.DATABASE_URL),
    PORT: assertPort(config.PORT ?? defaults.PORT),
    JWT_SECRET: config.JWT_SECRET ?? defaults.JWT_SECRET,
    JWT_REFRESH_SECRET: config.JWT_REFRESH_SECRET ?? defaults.JWT_REFRESH_SECRET,
    JWT_EXPIRES_IN: config.JWT_EXPIRES_IN ?? defaults.JWT_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN:
      config.JWT_REFRESH_EXPIRES_IN ?? defaults.JWT_REFRESH_EXPIRES_IN,
    CORS_ORIGIN: config.CORS_ORIGIN ?? defaults.CORS_ORIGIN,
  };

  return env;
}
