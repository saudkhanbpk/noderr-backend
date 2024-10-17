// Import required modules
import mongoose from "mongoose";
import dotenv from "dotenv";
import voucher_codes from "voucher-code-generator";
import jwt from "jsonwebtoken";

// Load environment variables from a .env file (optional)
dotenv.config();

// Define MongoDB connection string and database name
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/noderrDatabase";

// Define schema for the User collection
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    walletAddress: {
      type: String,
      required: true,
      unique: true,
    },
    node: [
      {
        type: Schema.Types.ObjectId,
        ref: "Node",
      },
    ],
    ticketNumber: {
      type: Number,
      default: 0,
    },
    referralCode: { type: String, unique: true, default: null },
    referredBy: { type: Schema.Types.ObjectId, ref: "User" },
    referredUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    totalReferrals: { type: Number, default: 0 },
    successfulReferrals: { type: Number, default: 0 },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

// Create a model for the User collection
const User = mongoose.model("User", userSchema);

// Connect to MongoDB and create the collection
const createCollection = async () => {
  try {
    // Connect to the database
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB.");

    // Optional: Insert sample data
    const sampleUsers = [
      {
        name: "dczadmin",
        email: "admin@example.com",
        walletAddress: "0x3826367C9A9412ed49bCC0b1A2FC77641e974831",
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        walletAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
      },
    ];

    // Insert sample users into the User collection
    await User.insertMany(sampleUsers);

    console.log("User collection created and sample data inserted.");
  } catch (error) {
    console.error("Error creating collection:", error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
};

// Execute the createCollection function
createCollection();
