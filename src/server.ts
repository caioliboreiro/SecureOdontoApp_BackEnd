import { app } from './app'
import { env } from '@/env'

const protocol = env.HTTPS_ENABLED ? 'https' : 'http'

app
  .listen({
    host: '0.0.0.0',
    port: env.PORT,
  })
  .then(() => {
    console.log(`🚀 ${protocol} server running at ${protocol}://localhost:${env.PORT}`)
  })
