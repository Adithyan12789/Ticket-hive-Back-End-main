"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AdminTokenService {
    constructor() {
        if (!process.env.JWT_SECRET_ADMIN) {
            throw new Error('JWT_SECRET_ADMIN is not defined');
        }
        this.jwtSecret = process.env.JWT_SECRET_ADMIN;
    }
    generateAdminToken(res, adminId) {
        console.log("AdminTokenService: Signing JWT for adminId:", adminId);
        const token = jsonwebtoken_1.default.sign({ adminId }, this.jwtSecret, {
            expiresIn: '30d',
        });
        console.log("AdminTokenService: Setting cookie 'jwtAdmin'");
        res.cookie('jwtAdmin', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000,
            path: '/',
        });
        return token;
    }
}
exports.default = new AdminTokenService();
//# sourceMappingURL=GenerateAdminToken.js.map