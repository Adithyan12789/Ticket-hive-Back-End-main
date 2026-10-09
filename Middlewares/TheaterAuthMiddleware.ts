import jwt from 'jsonwebtoken';
import expressAsyncHandler from 'express-async-handler';
import { Request, Response, NextFunction } from 'express';
import Theater from '../Models/TheaterOwnerModel';
import { JwtPayload } from 'jsonwebtoken';

interface CustomRequest extends Request {
  theaterOwner?: {
    _id: string;
    isBlocked: boolean;
  } | null;
}

class TheaterAuthMiddleware {
  static protect = expressAsyncHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
    let token: string | undefined = req.cookies?.theaterOwnerJwt;

    // Fallback to Bearer token if cookie is missing
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ message: 'Not authorized, no token provided' });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_THEATER as string) as JwtPayload;
      const theaterOwner = await Theater.findById(decoded.id).select('-password');

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
    } catch (error) {
      console.error("Theater Auth Error:", error);
      res.status(401).json({ message: 'Invalid or expired token' });
    }
  });
}

export { TheaterAuthMiddleware, CustomRequest };
