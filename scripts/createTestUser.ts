import "../Config/loadEnv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGO_URI = process.env.MONGO_URI as string;

async function createTestUser() {
  await mongoose.connect(MONGO_URI);
  const UserSchema = new mongoose.Schema({ name: String, email: { type: String, unique: true }, password: String, otpVerified: { type: Boolean, default: false }, isBlocked: { type: Boolean, default: false } });
  const User = mongoose.models.User || mongoose.model("User", UserSchema);

  const email = "testuser@tickethive.com";
  const password = "Test@1234";
  const hashedPassword = await bcrypt.hash(password, 10);

  const existing = await User.findOne({ email });
  if (existing) {
    await User.updateOne({ email }, { otpVerified: true, isBlocked: false, password: hashedPassword });
    console.log("Updated existing user:", email);
  } else {
    await User.create({ name: "Test User", email, password: hashedPassword, otpVerified: true, isBlocked: false });
    console.log("Created test user:", email);
  }
  console.log("Password:", password);
  await mongoose.disconnect();
}
createTestUser().catch(console.error);
