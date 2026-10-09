/**
 * One-time password reset script.
 * Usage: node scripts/reset-password.js
 * Delete this file after use.
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ─── CONFIG: Change these as needed ──────────────────────────────────────────
const TARGET_EMAIL   = "adithiruthiparambil12@gmail.com";
const NEW_PASSWORD   = "Test@1234"; // ← set the new password here
// ─────────────────────────────────────────────────────────────────────────────

async function resetPassword() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected.");

  const db = mongoose.connection.db;
  const users = db.collection("users");

  const user = await users.findOne({ email: TARGET_EMAIL });
  if (!user) {
    console.error(`❌ No user found with email: ${TARGET_EMAIL}`);
    process.exit(1);
  }

  console.log(`✅ Found user: ${user.name} (${user.email})`);
  console.log(`   Current hash: ${user.password}`);

  const salt = await bcrypt.genSalt(10);
  const newHash = await bcrypt.hash(NEW_PASSWORD, salt);

  await users.updateOne(
    { email: TARGET_EMAIL },
    { $set: { password: newHash, otpVerified: true } }
  );

  // Verify it works
  const matches = await bcrypt.compare(NEW_PASSWORD, newHash);
  console.log(`\n✅ Password reset successfully!`);
  console.log(`   Email   : ${TARGET_EMAIL}`);
  console.log(`   Password: ${NEW_PASSWORD}`);
  console.log(`   Hash OK : ${matches}`);
  console.log(`\n👉 You can now log in with the above credentials.`);
  console.log(`   Delete this script after use: scripts/reset-password.js`);

  await mongoose.disconnect();
  process.exit(0);
}

resetPassword().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
