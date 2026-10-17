"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class TokenService {
    static generateAccessToken(userId) {
        return jsonwebtoken_1.default.sign({ userId, tokenType: "access" }, process.env.JWT_SECRET, { expiresIn: "15m" });
    }
    static generateRefreshToken(userId) {
        return jsonwebtoken_1.default.sign({ userId, tokenType: "refresh" }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
    }
    static setTokenCookies(res, accessToken, refreshToken) {
        const isProduction = process.env.NODE_ENV === "production";
        console.log("Setting cookies with NODE_ENV:", process.env.NODE_ENV);
        console.log("Cookie settings - secure:", isProduction, "sameSite:", isProduction ? "none" : "lax");
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 15 * 60 * 1000,
            path: "/",
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
        });
        console.log("Cookies set successfully");
    }
    static verifyAccessToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            return decoded.tokenType === "access" ? decoded : null;
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }
    static verifyRefreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET);
            return decoded.tokenType === "refresh" ? decoded : null;
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }
}
exports.default = TokenService;
//# sourceMappingURL=GenerateToken.js.map