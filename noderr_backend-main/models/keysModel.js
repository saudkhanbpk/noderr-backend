import mongoose from "mongoose";

const Schema = mongoose.Schema;

const keySchema = new Schema({
  publicKey: {
    type: String,
    required: true,
    unique: true,
  },
  privateKey: {
    type: String,
    required: true,
    unique: true,
  },
});
const Keys = mongoose.model("Key", keySchema);

export default Keys;
// Path: models/keysModel.js