"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const routes_1 = require("./routes");
const cors_1 = __importDefault(require("@fastify/cors"));
require("dotenv/config");
const app = (0, fastify_1.default)();
app.register(cors_1.default, {
    origin: process.env.FRONTEND_URL ?? '*',
    credentials: true,
});
// app.use(cors({
//   origin: process.env.FRONTEND_URL?.split(',') ?? '*', // ex: https://seu-front.vercel.app
//   methods: ['GET','POST','PATCH','PUT','DELETE','OPTIONS'],
// }))
app.register(routes_1.appRoutes);
const PORT = Number(process.env.PORT) || 3333;
app.listen({ port: PORT, host: '0.0.0.0' }, () => {
    console.log(`HTTP server running on :${PORT}`);
});
app.get('/health', (_req, res) => res.send('ok'));
// app.listen({
//   port: 3333,
// }).then(() => {
//   console.log('HTTP Server is running!')
// })
