import Fastify from 'fastify'
import { appRoutes } from './routes'
import cors from '@fastify/cors'
import 'dotenv/config'

const app = Fastify()

app.register(cors, {
  origin: process.env.FRONTEND_URL ?? '*',
  credentials: true,
})

app.register(appRoutes)

const PORT = Number(process.env.PORT) || 3333

app.listen({ port: PORT, host: '0.0.0.0' }, () => {
  console.log(`HTTP server running on :${PORT}`)
})

app.get('/health', (_req, res) => res.send('ok'))