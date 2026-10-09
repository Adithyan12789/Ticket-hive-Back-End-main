import jwt from 'jsonwebtoken';
import expressAsyncHandler from 'express-async-handler';
import { Request, Response, NextFunction } from 'express';

export interface CustomRequest extends Request {
    admin?: {
        _id: string;
    } | undefined;
}

class AdminAuthMiddleware {
    static protect = expressAsyncHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
        let token: string | undefined = req.cookies?.jwtAdmin;

        // Fallback to Bearer token if cookie is missing
        if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN as string);

                if (typeof decoded === "object" && decoded !== null && 'adminId' in decoded) {
                    req.admin = {
                        _id: decoded.adminId.toString(),
                    };
                } else {
                    res.status(401);
                    throw new Error('Not Authorized, invalid Admin token content');
                }

                next();
            } catch (error: any) {
                console.error("AdminAuth Error:", error.message);
                res.status(401);
                throw new Error(`Not Authorized: ${error.message}`);
            }
        } else {
            res.status(401);
            throw new Error('Not Authorized, no admin token found in cookie or header');
        }
    });
}

export { AdminAuthMiddleware };
