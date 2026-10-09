"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TheaterAuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const TheaterOwnerModel_1 = __importDefault(require("../Models/TheaterOwnerModel"));
class TheaterAuthMiddleware {
}
exports.TheaterAuthMiddleware = TheaterAuthMiddleware;
_a = TheaterAuthMiddleware;
TheaterAuthMiddleware.protect = (0, express_async_handler_1.default)(async (req, res, next) => {
    let token = req.cookies?.theaterOwnerJwt;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token provided' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_THEATER);
        const theaterOwner = await TheaterOwnerModel_1.default.findById(decoded.id).select('-password');
        if (!theaterOwner) {
            res.clearCookie('theaterOwnerJwt', { path: '/' });
            res.status(401).json({ message: 'Theater owner not found' });
            return;
        }
        if (theaterOwner.isBlocked) {
            res.clearCookie('theaterOwnerJwt', { path: '/' });
            res.status(403).json({ message: 'Theater owner is blocked' });
            return;
        }
        req.theaterOwner = {
            _id: theaterOwner._id.toString(),
            isBlocked: theaterOwner.isBlocked ?? false,
        };
        next();
    }
    catch (error) {
        console.error("Theater Auth Error:", error);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
});
//# sourceMappingURL=TheaterAuthMiddleware.js.map