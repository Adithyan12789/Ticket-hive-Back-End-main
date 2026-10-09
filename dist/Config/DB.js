"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
class Database {
    async connectDB() {
        try {
            const conn = await mongoose_1.default.connect(process.env.MONGO_URI);
            console.log(`MongoDB Connected: ${conn.connection.host}`);
        }
        catch (error) {
            console.error("❌ MONGODB CONNECTION ERROR ❌");
            if (error instanceof Error) {
                console.error(`Message: ${error.message}`);
                if (error.message.includes("authentication failed")) {
                    console.error("💡 HINT: Check your MONGO_URI in Render Authentication.");
                    console.error("   - Ensure your password has no unencoded special characters like @, :, /");
                    console.error("   - If your password is 'pass@123', write it as 'pass%40123'");
                }
            }
            else {
                console.error(`Unexpected error: ${error}`);
            }
        }
    }
}
exports.default = new Database();
//# sourceMappingURL=DB.js.map