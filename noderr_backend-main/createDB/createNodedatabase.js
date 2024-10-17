// Import required modules
import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from a .env file (optional)
dotenv.config();

// Define MongoDB connection string and database name
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/noderrDatabse";

// Define schema for the Node collection
const Schema = mongoose.Schema;

const nodeSchema = new Schema(
  {
    nodeName: {
      type: String,
      required: true,
      unique: true,
    },
    nodePrice: {
      type: Number,
      required: true,
    },
    nodeImage: {
      public_id: {
        type: String,
        required: true,
        default: "defaultPublicId",
      },
      url: {
        type: String,
        required: true,
        default: "https://example.com/defaultImage.jpg",
      },
    },
    slots: {
      type: Number,
      required: true,
      default: 0,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Create a model for the Node collection
const Node = mongoose.model("Node", nodeSchema);

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
    const sampleNodes = [
      { nodeName: "Node1", nodePrice: 100, slots: 10, blockchain: "Ethereum" },
      { nodeName: "Node2", nodePrice: 150, slots: 5, blockchain: "Bitcoin" },
      { nodeName: "Node3", nodePrice: 200, slots: 15, blockchain: "Solana" },
    ];

    await Node.insertMany(sampleNodes); // Insert the sample data

    console.log("Node collection created and sample data inserted.");
  } catch (error) {
    console.error("Error creating collection:", error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
};

// Execute the createCollection function
createCollection();
