"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const GenerateToken_1 = __importDefault(require("../Utils/GenerateToken"));
const UserModel_1 = __importDefault(require("../Models/UserModel"));
const AuthMiddleware = (0, express_async_handler_1.default)(async (req, res, next) => {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;
    if (!accessToken && !refreshToken) {
        console.error("Authentication failed: No tokens provided.");
        res.status(401);
        throw new Error("Not authorized, no tokens provided");
    }
    if (accessToken) {
        const decodedAccess = GenerateToken_1.default.verifyAccessToken(accessToken);
        if (decodedAccess) {
            console.log("Access token decoded successfully:", decodedAccess);
            const user = await UserModel_1.default.findById(decodedAccess.userId).select("-password");
            if (!user) {
                console.error(`User not found for ID: ${decodedAccess.userId}`);
                res.status(401);
                throw new Error("User not found or no longer exists");
            }
            if (user.isBlocked) {
                console.error(`Blocked user attempted access: ${user._id}`);
                res.status(403);
                throw new Error("User is blocked");
            }
            req.user = {
                _id: user._id.toString(),
                isBlocked: user.isBlocked ?? false,
            };
            return next();
        }
        console.error("Access token is invalid or expired");
    }
    if (refreshToken) {
        const decodedRefresh = GenerateToken_1.default.verifyRefreshToken(refreshToken);
        if (decodedRefresh) {
            console.log("Refresh token decoded successfully:", decodedRefresh);
            const user = await UserModel_1.default.findById(decodedRefresh.userId);
            if (!user) {
                console.error(`User not found for ID: ${decodedRefresh.userId}`);
                res.status(401);
                throw new Error("User not found or no longer exists");
            }
            const newAccessToken = GenerateToken_1.default.generateAccessToken(user._id.toString());
            GenerateToken_1.default.setTokenCookies(res, newAccessToken, refreshToken);
            console.log("New access token issued and cookies updated");
            req.user = {
                _id: user._id.toString(),
                isBlocked: user.isBlocked ?? false,
            };
            return next();
        }
        console.error("Refresh token is invalid or expired");
    }
    res.status(401);
    throw new Error("Not authorized, invalid or expired token");
});
exports.AuthMiddleware = AuthMiddleware;
//# sourceMappingURL=AuthMiddleware.js.map