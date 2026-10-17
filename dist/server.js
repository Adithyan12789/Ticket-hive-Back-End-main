"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("./Config/loadEnv");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
console.log("Backend Environment Status Check:");
console.log("- CWD:", process.cwd());
console.log("- PORT:", process.env.PORT || 5000);
console.log("- MONGO_URI:", process.env.MONGO_URI ? "Loaded" : "MISSING");
console.log("- EMAIL_USER:", (process.env.EMAIL_USER || process.env.SMTP_USER) ? "Loaded" : "MISSING");
console.log("- ADMIN_EMAIL:", process.env.ADMIN_EMAIL ? "Loaded (Value: " + (process.env.ADMIN_EMAIL || "N/A") + ")" : "MISSING");
console.log("- JWT_SECRET_ADMIN:", process.env.JWT_SECRET_ADMIN ? "Loaded" : "MISSING");
const DB_1 = __importDefault(require("./Config/DB"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const UserRoutes_1 = __importDefault(require("./Routes/UserRoutes"));
const AdminRoutes_1 = __importDefault(require("./Routes/AdminRoutes"));
const TheaterRoutes_1 = __importDefault(require("./Routes/TheaterRoutes"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const Socket_1 = require("./Config/Socket");
const EmailUtil_1 = __importDefault(require("./Utils/EmailUtil"));
Socket_1.app.set("io", Socket_1.io);
DB_1.default.connectDB();
EmailUtil_1.default.verifyConnection().catch((err) => {
    console.error("[Startup] ⚠️  Email (SMTP) is NOT working:", err.message);
    console.error("[Startup] OTP emails will fail. Check EMAIL_USER and EMAIL_PASS in .env");
});
const port = process.env.PORT || 5000;
Socket_1.app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        const allowedProductionOrigins = [
            "https://ticket-hive-main.vercel.app",
            "https://www.ticket-hive-main.vercel.app"
        ];
        if (!origin)
            return callback(null, true);
        const normalizedOrigin = origin.replace(/\/$/, '');
        if (/^http:\/\/localhost(:\d+)?$/.test(normalizedOrigin)) {
            return callback(null, true);
        }
        if (allowedProductionOrigins.includes(normalizedOrigin)) {
            callback(null, true);
        }
        else {
            console.warn(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
}));
Socket_1.app.use(express_1.default.json());
Socket_1.app.use(express_1.default.urlencoded({ extended: true }));
Socket_1.app.use((0, cookie_parser_1.default)());
Socket_1.app.use((0, morgan_1.default)('dev'));
const getStaticPath = () => {
    const paths = [
        path_1.default.join(process.cwd(), 'public'),
        path_1.default.join(process.cwd(), 'Back-End', 'public'),
        path_1.default.join(__dirname, 'public'),
        path_1.default.join(__dirname, '../public'),
        path_1.default.join(__dirname, '..', 'public')
    ];
    for (const p of paths) {
        if (fs_1.default.existsSync(p)) {
            console.log(`Found static folder at: ${p}`);
            return p;
        }
    }
    const fallback = path_1.default.join(process.cwd(), 'public');
    console.warn(`No static folder found in expected locations, falling back to: ${fallback}`);
    return fallback;
};
const staticPath = getStaticPath();
Socket_1.app.use(express_1.default.static(staticPath));
['CastsImages', 'CastImages', 'movieImages', 'MovieImages', 'MoviePosters', 'MovieBanners', 'TheatersImages', 'TheatersImage', 'UserProfileImages', 'TheaterProfileImages', 'MessageFiles', 'UploadsCerificates', 'UploadsCertificates'].forEach(folder => {
    const folderPath = path_1.default.join(staticPath, folder);
    if (fs_1.default.existsSync(folderPath)) {
        Socket_1.app.use(`/${folder}`, express_1.default.static(folderPath));
        Socket_1.app.use(`/${folder.toLowerCase()}`, express_1.default.static(folderPath));
    }
});
console.log("Static files will be served from:", staticPath);
Socket_1.app.use((req, res, next) => {
    if (req.url.match(/\.(jpg|jpeg|png|gif|webp|avif|jfif|svg)$/i)) {
        const filePath = path_1.default.join(staticPath, req.url);
        if (!fs_1.default.existsSync(filePath)) {
            console.warn(`[404] Static file not found: ${req.url} (Looking in: ${filePath})`);
        }
        else {
            console.log(`[200] Serving static file: ${req.url}`);
        }
    }
    next();
});
Socket_1.app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        staticPath: staticPath,
        exists: fs_1.default.existsSync(staticPath)
    });
});
Socket_1.app.use("/api/users", UserRoutes_1.default);
Socket_1.app.use("/api/admin", AdminRoutes_1.default);
Socket_1.app.use("/api/theater", TheaterRoutes_1.default);
Socket_1.app.use((err, req, res, next) => {
    console.error("Caught error in Global Error Handler:", err);
    const status = err.status || (res.statusCode !== 200 ? res.statusCode : 500);
    res.status(status).json({
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
        error: typeof err === 'string' ? err : err.message,
    });
});
Socket_1.server.listen(port, () => console.log(`Server Is Running On Port http://localhost:${port}/`));
//# sourceMappingURL=server.js.map