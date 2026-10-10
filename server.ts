import "reflect-metadata";
import "./Config/loadEnv";
import path from "path";
import fs from "fs";

console.log("Backend Environment Status Check:");
console.log("- CWD:", process.cwd());
console.log("- PORT:", process.env.PORT || 5000);
console.log("- MONGO_URI:", process.env.MONGO_URI ? "Loaded" : "MISSING");
console.log("- EMAIL_USER:", (process.env.EMAIL_USER || process.env.SMTP_USER) ? "Loaded" : "MISSING");
console.log("- ADMIN_EMAIL:", process.env.ADMIN_EMAIL ? "Loaded (Value: " + (process.env.ADMIN_EMAIL || "N/A") + ")" : "MISSING");
console.log("- JWT_SECRET_ADMIN:", process.env.JWT_SECRET_ADMIN ? "Loaded" : "MISSING");

import Database from "./Config/DB";
import cookieParser from "cookie-parser";
import UserRoutes from "./Routes/UserRoutes";
import AdminRoutes from "./Routes/AdminRoutes";
import TheaterRoutes from "./Routes/TheaterRoutes";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import { app, server, io } from "./Config/Socket";
import EmailUtil from "./Utils/EmailUtil";

app.set("io", io);

Database.connectDB();

// Verify SMTP connection on startup — catches wrong app password immediately
EmailUtil.verifyConnection().catch((err) => {
  console.error("[Startup] ⚠️  Email (SMTP) is NOT working:", err.message);
  console.error("[Startup] OTP emails will fail. Check EMAIL_USER and EMAIL_PASS in .env");
});

const port = process.env.PORT || 5000;

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:3000",
      "https://ticket-hive-main.vercel.app",
      "https://www.ticket-hive-main.vercel.app"
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Remove trailing slash for comparison
    const normalizedOrigin = origin.replace(/\/$/, '');

    if (allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Configure cookie settings for cross-origin
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Credentials', 'true');
//   next();
// });


const getStaticPath = () => {
  const paths = [
    path.join(process.cwd(), 'public'),
    path.join(process.cwd(), 'Back-End', 'public'),
    path.join(__dirname, 'public'),
    path.join(__dirname, '../public'),
    path.join(__dirname, '..', 'public')
  ];

  for (const p of paths) {
    if (fs.existsSync(p)) {
      console.log(`Found static folder at: ${p}`);
      return p;
    }
  }

  // Fallback to a default but log warning
  const fallback = path.join(process.cwd(), 'public');
  console.warn(`No static folder found in expected locations, falling back to: ${fallback}`);
  return fallback;
};

const staticPath = getStaticPath();
app.use(express.static(staticPath));

// Explicit subfolder serving for extra robustness (some platforms need this)
['CastsImages', 'CastImages', 'movieImages', 'MovieImages', 'MoviePosters', 'MovieBanners', 'TheatersImages', 'TheatersImage', 'UserProfileImages', 'TheaterProfileImages', 'MessageFiles', 'UploadsCerificates', 'UploadsCertificates'].forEach(folder => {
  const folderPath = path.join(staticPath, folder);
  if (fs.existsSync(folderPath)) {
    app.use(`/${folder}`, express.static(folderPath));
    // Also serve as lowercase alias for better compatibility
    app.use(`/${folder.toLowerCase()}`, express.static(folderPath));
  }
});

console.log("Static files will be served from:", staticPath);

// Debugging middleware for static assets (only logs in dev/logs environment)
app.use((req, res, next) => {
  if (req.url.match(/\.(jpg|jpeg|png|gif|webp|avif|jfif|svg)$/i)) {
    // Check if the requested file exists
    const filePath = path.join(staticPath, req.url);
    if (!fs.existsSync(filePath)) {
      console.warn(`[404] Static file not found: ${req.url} (Looking in: ${filePath})`);
    } else {
      console.log(`[200] Serving static file: ${req.url}`);
    }
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    staticPath: staticPath,
    exists: fs.existsSync(staticPath)
  });
});

app.use("/api/users", UserRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/theater", TheaterRoutes);

// Global Error Handler - captures all errors thrown in routes
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Caught error in Global Error Handler:", err);

  // Use status from error object, or from response if it was already set, or default to 500
  const status = err.status || (res.statusCode !== 200 ? res.statusCode : 500);

  res.status(status).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
    // Add original error for easier debugging (stringified)
    error: typeof err === 'string' ? err : err.message,
  });
});

server.listen(port, () => console.log(`Server Is Running On Port http://localhost:${port}/`));
