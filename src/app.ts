import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import globalErrorHandler from './middlewares/globalErrorHandler';
import notFound from './middlewares/notFound';
import router from './routes/index';
import { auth } from './lib/auth';
import { toNodeHandler } from 'better-auth/node';

const app: Application = express();

// allowed origins properly
const allowedOrigins = process.env.NODE_ENV === "development" 
  ? ["http://localhost:3000"]
  : [process.env.APP_URL || "http://localhost:5000"].filter(Boolean); 


// cors configuration

app.use(cors({
  origin: allowedOrigins as string[],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Better Auth handles all /api/auth/* routes automatically
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json());

// Application Routes
app.use('/api/v1', router);

// Testing route
app.get('/', (req: Request, res: Response) => {
  res.send('Tutor Link Server is running!');
});

// Middlewares
app.use(globalErrorHandler); // Must be after routes
app.use(notFound);           

export default app;