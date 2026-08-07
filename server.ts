import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { connectDB } from './server/config/db';
import healthRoutes from './server/routes/health';
import { errorHandler } from './server/middleware/error';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security Middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled for local development to allow Vite HMR and inline scripts
  }));
  
  // CORS configuration
  app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  }));

  // JSON Body parsing
  app.use(express.json({ limit: '10mb' }));

  // Connect to MongoDB
  await connectDB();

  // API Routes
  app.use('/api', healthRoutes);

  // Error Handling Middleware
  app.use(errorHandler);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);
