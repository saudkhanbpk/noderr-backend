// Import required modules
import dotenv from "dotenv";
import mongoose from "mongoose";
import Vm from "../models/vmModel.js";

// Load environment variables from a .env file (optional)
dotenv.config();

// Define MongoDB connection string and database name
const MONGO_URI = "mongodb://88.216.222.3:27017/noderrDatabase";
console.log(MONGO_URI);

// Connect to MongoDB and create the collection
const createCollection = async () => {
  try {
    // Connect to the database
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB.");

    let vm_data = [];
    for (let i = 45; i < 55; i ++) {
      const vm_ip = "88.216.222." + i;
      const data = {
        vm_ip: vm_ip,
        vm_username: "nd-vm-admin",
        vm_password: "123@@abcU",
        node_type: "og",
      }
      vm_data.push(data);
    }
    console.log(vm_data);

    // Insert sample users into the User collection
    await Vm.insertMany(vm_data);

    console.log("Vm collection created and sample data inserted.");
  } catch (error) {
    console.error("Error creating collection:", error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
};

// Execute the createCollection function
createCollection();

// export default createCollection;