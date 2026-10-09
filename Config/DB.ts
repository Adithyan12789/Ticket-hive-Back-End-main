import mongoose from "mongoose";

class Database {

    public async connectDB(): Promise<void> {
        try {
            const conn = await mongoose.connect(process.env.MONGO_URI as string);
            console.log(`MongoDB Connected: ${conn.connection.host}`);
        } catch (error) {
            console.error("❌ MONGODB CONNECTION ERROR ❌");
            if (error instanceof Error) {
                console.error(`Message: ${error.message}`);
                if (error.message.includes("authentication failed")) {
                    console.error("💡 HINT: Check your MONGO_URI in Render Authentication.");
                    console.error("   - Ensure your password has no unencoded special characters like @, :, /");
                    console.error("   - If your password is 'pass@123', write it as 'pass%40123'");
                }
            } else {
                console.error(`Unexpected error: ${error}`);
            }
            // process.exit(1); // COMMENTED OUT FOR DEBUGGING - Keep server alive to see logs
        }
    }
}

export default new Database();
