export type AppEnv = {
  DATABASE_URL?: string
  NODE_ENV?: string
}

export function readAndValidateEnv(): AppEnv {
  const env: AppEnv = {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  }

  const isProd = env.NODE_ENV === 'production'
  const missing: string[] = []

  if (!env.DATABASE_URL) missing.push('DATABASE_URL')

  if (isProd && missing.length > 0) {
    // In production, fail fast if required env vars are missing
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  return env
}
