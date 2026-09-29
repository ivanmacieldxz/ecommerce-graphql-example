import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { connectDB } from './config/db.js';
import { typeDefs } from './graphql/typeDefs.js';
import { resolvers } from './graphql/resolvers.js';

dotenv.config();

const PORT = process.env.PORT || 4000;
const app = express();
const httpServer = http.createServer(app);

async function startServer() {
  // Conectar a MongoDB Atlas (con manejo resiliente)
  try {
    await connectDB();
  } catch (error) {
    console.warn('⚠️ Advertencia: No se pudo establecer la conexión inicial con MongoDB Atlas.');
    console.warn('   Si estás en desarrollo local o Render, agrega la regla 0.0.0.0/0 en MongoDB Atlas -> Network Access.');
  }

  // Configuración de Apollo Server v4
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true, // Introspección explícitamente habilitada para producción y desarrollo
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // Plugin de Apollo Sandbox embebido activo para Render y local
      ApolloServerPluginLandingPageLocalDefault({ embed: true, footer: false }),
    ],
    formatError: (formattedError, error) => {
      console.error('GraphQL Error:', formattedError);
      return formattedError;
    },
  });

  // Iniciar Apollo Server
  await server.start();

  // Middlewares globales de Express
  app.use(cors());
  app.use(express.json());

  // Endpoint de salud (Health check para Render / Uptime monitors)
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'GraphQL Products API',
    });
  });

  // Redirección de la raíz a /graphql para facilitar la exploración
  app.get('/', (_req, res) => {
    res.redirect('/graphql');
  });

  // Integración de Apollo Server en /graphql
  app.use(
    '/graphql',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ req }),
    })
  );

  // Iniciar servidor HTTP en 0.0.0.0 para compatibilidad con Render y contenedores
  await new Promise((resolve) => httpServer.listen({ port: PORT, host: '0.0.0.0' }, resolve));

  console.log(`🚀 Servidor listo en: http://0.0.0.0:${PORT}/graphql`);
  console.log(`🧭 Apollo Sandbox disponible en: http://localhost:${PORT}/graphql`);
  console.log(`🩺 Health check disponible en: http://localhost:${PORT}/health`);
}

startServer().catch((error) => {
  console.error('❌ Error fatal al iniciar el servidor:', error);
  process.exit(1);
});
