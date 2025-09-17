export type AppEnv = {
  DATABASE_URL?: string
  NEXT_PUBLIC_SITE_URL?: string
  NODE_ENV?: string
  NEXTAUTH_URL?: string
  NEXTAUTH_SECRET?: string
}

export function readAndValidateEnv(): AppEnv {
  const env: AppEnv = {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  }

  const mode = env.NODE_ENV || 'development'
  const isProd = mode === 'production'
  const isStaging = mode === 'staging'

  const missing: string[] = []
  if (!env.DATABASE_URL) missing.push('DATABASE_URL')
  if (!env.NEXT_PUBLIC_SITE_URL) missing.push('NEXT_PUBLIC_SITE_URL')
  if (isProd || isStaging) {
    if (!env.NEXTAUTH_URL) missing.push('NEXTAUTH_URL')
    if (!env.NEXTAUTH_SECRET) missing.push('NEXTAUTH_SECRET')
  } else {
    // Safe dev defaults to prevent warnings
    if (!env.NEXTAUTH_URL) env.NEXTAUTH_URL = 'http://localhost:3002'
    if (!env.NEXTAUTH_SECRET) env.NEXTAUTH_SECRET = 'dev-secret-change-me'
  }

  if ((isProd || isStaging) && missing.length > 0) {
    throw new Error(`Missing required environment variables (${mode}): ${missing.join(', ')}`)
  }

  return env
}
