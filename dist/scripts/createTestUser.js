"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("../Config/loadEnv");
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const MONGO_URI = process.env.MONGO_URI;
async function createTestUser() {
    await mongoose_1.default.connect(MONGO_URI);
    const UserSchema = new mongoose_1.default.Schema({ name: String, email: { type: String, unique: true }, password: String, otpVerified: { type: Boolean, default: false }, isBlocked: { type: Boolean, default: false } });
    const User = mongoose_1.default.models.User || mongoose_1.default.model("User", UserSchema);
    const email = "testuser@tickethive.com";
    const password = "Test@1234";
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const existing = await User.findOne({ email });
    if (existing) {
        await User.updateOne({ email }, { otpVerified: true, isBlocked: false, password: hashedPassword });
        console.log("Updated existing user:", email);
    }
    else {
        await User.create({ name: "Test User", email, password: hashedPassword, otpVerified: true, isBlocked: false });
        console.log("Created test user:", email);
    }
    console.log("Password:", password);
    await mongoose_1.default.disconnect();
}
createTestUser().catch(console.error);
//# sourceMappingURL=createTestUser.js.map