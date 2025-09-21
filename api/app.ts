/**
 * This is a API server
 */

import express, { type Request, type Response, type NextFunction }  from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import moviesRoutes from './routes/movies.js';
import charactersRoutes from './routes/characters.js';
import scenesRoutes from './routes/scenes.js';
import subtitleSegmentsRoutes from './routes/subtitleSegments.js';
import referencesRoutes from './routes/references.js';
import characterNotesRoutes from './routes/characterNotes.js';
import narrativeRoutes from './routes/narrative.js';
import movieScriptsRoutes from './routes/movieScripts.js';
import movieDialoguesRoutes from './routes/movieDialogues.js';

// load env
dotenv.config();


const app: express.Application = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/movies', moviesRoutes);
app.use('/api', charactersRoutes);
app.use('/api', scenesRoutes);
app.use('/api', subtitleSegmentsRoutes);
app.use('/api', referencesRoutes);
app.use('/api', characterNotesRoutes);
app.use('/api', movieScriptsRoutes);
app.use('/api', movieDialoguesRoutes);
app.use('/api', narrativeRoutes);

/**
 * health
 */
app.use('/api/health', (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'ok'
  });
});

/**
 * error handler middleware
 */
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  void _next;
  console.error('Unhandled API error:', error);
  res.status(500).json({
    success: false,
    error: 'Server internal error'
  });
});

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found'
  });
});

export default app;
