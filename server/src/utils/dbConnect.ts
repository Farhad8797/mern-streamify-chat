import mongoose from "mongoose";

export default async function dbConnect() {
  try {
    const connectionInstance = await mongoose.connect(
      process.env.MONGODB_URI as string,
    );
    console.log(
      `Database connection successful: ${connectionInstance.connection.host}`,
    );
  } catch (err) {
    console.error("mongodb connection error: ", err);
    process.exit(1);
  }
}
