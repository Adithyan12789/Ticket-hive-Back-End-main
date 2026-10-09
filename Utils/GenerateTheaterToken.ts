import { Response } from 'express';
import jwt from 'jsonwebtoken';

class TheaterTokenService {
    private jwtSecret: string;

    constructor() {
        console.log("process.env.JWT_SECRET_THEATER: ", process.env.JWT_SECRET_THEATER);

        if (!process.env.JWT_SECRET_THEATER) {
            console.log("There is no jwt secret theater");

            throw new Error('JWT_SECRET_THEATER is not defined');
        }
        this.jwtSecret = process.env.JWT_SECRET_THEATER;
        console.log("this.jwtSecret: ", this.jwtSecret);
    }

    public generateTheaterToken(res: Response, theaterOwnerId: string): string {
        const token = jwt.sign({ id: theaterOwnerId }, this.jwtSecret, { expiresIn: '30d' });

        res.cookie('theaterOwnerJwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Use 'none' for cross-site in production
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return token;
    }
}

export default new TheaterTokenService();
