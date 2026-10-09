
import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import TokenService from "../Utils/GenerateToken";
import User from "../Models/UserModel";

interface CustomRequest extends Request {
  user?: {
    _id: string;
    isBlocked: boolean;
  };
}

const AuthMiddleware = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    if (!accessToken && !refreshToken) {
      console.error("Authentication failed: No tokens provided.");
      res.status(401);
      throw new Error("Not authorized, no tokens provided");
    }

    if (accessToken) {
      const decodedAccess = TokenService.verifyAccessToken(accessToken);
      if (decodedAccess) {
        console.log("Access token decoded successfully:", decodedAccess);

        const user = await User.findById(decodedAccess.userId).select("-password");
        if (!user) {
          console.error(`User not found for ID: ${decodedAccess.userId}`);
          res.status(401);
          throw new Error("User not found or no longer exists");
        }

        if (user.isBlocked) {
          console.error(`Blocked user attempted access: ${user._id}`);
          res.status(403); // Forbidden
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
      const decodedRefresh = TokenService.verifyRefreshToken(refreshToken);
      if (decodedRefresh) {
        console.log("Refresh token decoded successfully:", decodedRefresh);

        const user = await User.findById(decodedRefresh.userId);
        if (!user) {
          console.error(`User not found for ID: ${decodedRefresh.userId}`);
          res.status(401);
          throw new Error("User not found or no longer exists");
        }

        const newAccessToken = TokenService.generateAccessToken(user._id.toString());
        TokenService.setTokenCookies(res, newAccessToken, refreshToken);
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
  }
);

export { AuthMiddleware, CustomRequest };
