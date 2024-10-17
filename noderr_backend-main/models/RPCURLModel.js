import mongoose from "mongoose";

const Schema = mongoose.Schema;

const RPCURLSchema = new Schema({
  node_type: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  }
}, {
  timestamps: true,
})

const RPCURL = mongoose.model("RPCURL", RPCURLSchema);
export default RPCURL;
