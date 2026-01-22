import mongoose from "mongoose";
import { envs } from "../../../../envConfig";

const MONGODB_URI =
  envs.MONGODB_URI ||
  "mongodb+srv://mueezsanwo_db_user:58ReSbX21Hq1aVVh@cluster.mongodb.net/everythingcredit";


let isConnected = false; // Global flag for connection state

export default async function connectDB() {
  if (isConnected) {
    console.info("Database already connected");
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false, // Disables mongoose buffering in case of disconnected database
    });
    isConnected = true;
    console.info("Database Connected Successfully");
  } catch (error) {
    console.error("Unable to connect to database: ", error);
    process.exit(1);
  }

  // Event Listeners
  mongoose.connection.on("connected", () => {
    console.info("Mongoose connected to DB");
  });

  mongoose.connection.on("error", (err) => {
    console.error("Mongoose connection error: ", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.info("Mongoose disconnected");
  });

  // Handle app termination
  process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.info("Mongoose connection closed due to app termination");
    process.exit(0);
  });
}
