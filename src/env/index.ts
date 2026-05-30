import 'dotenv/config'

import { z } from 'zod'
const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
  JWT_SECRET: z.string(),
  PORT: z.coerce.number().default(3333),
  HTTPS_ENABLED: z.coerce.boolean().default(false),
  SSL_CERT_PATH: z.string().default('./certs/server.crt'),
  SSL_KEY_PATH: z.string().default('./certs/server.key'),
  // SENTRY_DSN: z.string().url(),
  // SMTP_HOST: z.string(),
  // SMTP_PORT: z.coerce.number(),
  // SMTP_USER: z.string(),
  // SMTP_PASS: z.string(),
  // SMTP_FROM: z.string().email(),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.log('Invalid enviroment variables.', _env.error.format())

  throw new Error('Invalid enviroment variables.')
}

export const env = _env.data
