"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class TheaterTokenService {
    constructor() {
        console.log("process.env.JWT_SECRET_THEATER: ", process.env.JWT_SECRET_THEATER);
        if (!process.env.JWT_SECRET_THEATER) {
            console.log("There is no jwt secret theater");
            throw new Error('JWT_SECRET_THEATER is not defined');
        }
        this.jwtSecret = process.env.JWT_SECRET_THEATER;
        console.log("this.jwtSecret: ", this.jwtSecret);
    }
    generateTheaterToken(res, theaterOwnerId) {
        const isProduction = process.env.NODE_ENV === 'production';
        const token = jsonwebtoken_1.default.sign({ id: theaterOwnerId }, this.jwtSecret, { expiresIn: '30d' });
        res.cookie('theaterOwnerJwt', token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000,
            path: '/',
        });
        return token;
    }
}
exports.default = new TheaterTokenService();
//# sourceMappingURL=GenerateTheaterToken.js.map