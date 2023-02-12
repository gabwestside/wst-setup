import Fastify from 'fastify'
import { appRoutes } from './routes'
import cors from '@fastify/cors'

const app = Fastify()

app.register(cors)
app.register(appRoutes)

app.listen({
  port: 3333,
}).then(() => {
  console.log('HTTP Server is running!')
})
