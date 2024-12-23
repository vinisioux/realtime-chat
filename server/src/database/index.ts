import mongoose from "mongoose";

const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/webchat";

async function createConnection() {
  await mongoose.connect(mongoURI);
}

export { createConnection };
