"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
class AdminAuthMiddleware {
}
exports.AdminAuthMiddleware = AdminAuthMiddleware;
_a = AdminAuthMiddleware;
AdminAuthMiddleware.protect = (0, express_async_handler_1.default)(async (req, res, next) => {
    let token = req.cookies?.jwtAdmin;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_ADMIN);
            if (typeof decoded === "object" && decoded !== null && 'adminId' in decoded) {
                req.admin = {
                    _id: decoded.adminId.toString(),
                };
            }
            else {
                res.status(401);
                throw new Error('Not Authorized, invalid Admin token content');
            }
            next();
        }
        catch (error) {
            console.error("AdminAuth Error:", error.message);
            res.status(401);
            throw new Error(`Not Authorized: ${error.message}`);
        }
    }
    else {
        res.status(401);
        throw new Error('Not Authorized, no admin token found in cookie or header');
    }
});
//# sourceMappingURL=AdminAuthMiddleware.js.map