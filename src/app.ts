import fastify from 'fastify'
import { readFileSync } from 'node:fs'
import { ZodError } from 'zod'
import { env } from '@/env'
import { appRoutes } from './http/routes'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'
import fastifyCookie from '@fastify/cookie'
import * as Sentry from '@sentry/node'

// Sentry.init({
//   dsn: env.SENTRY_DSN,
//   environment: env.NODE_ENV,
//   tracesSampleRate: 1.0,
// })

const fastifyOpts = env.HTTPS_ENABLED
  ? {
      https: {
        key: readFileSync(env.SSL_KEY_PATH),
        cert: readFileSync(env.SSL_CERT_PATH),
      },
    }
  : {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const app = fastify(fastifyOpts as any).withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'OdontoApp',
      description:
        'Back end do OdontoApp, aplicativo desenvolvido na disciplina de engenharia de software.',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: 'refreshToken',
    signed: false,
  },
  sign: {
    expiresIn: '7d',
  },
})

app.register(fastifyCookie)

app.register(appRoutes)

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: 'Validation error.', issues: error.format() })
  }

  if (error.validation || error.code === 'FST_ERR_VALIDATION') {
    return reply.status(400).send({
      message: 'Validation error.',
      issues: error.validation || error.validationContext,
    })
  }

  Sentry.captureException(error)

  if (env.NODE_ENV !== 'production') {
    console.error(error)
  }

  return reply.status(500).send({ message: 'Erro interno.' })
})
