import mongoose from "mongoose";

const Schema = mongoose.Schema;

const nodeSchema = new Schema(

  {
    amount: {
      type: Number,
      required: true,
    },
    nodeId: {
      type: Object,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    privateKey: {
      type: String,
      required: true,
    },
    rpcUrl: {
      type: String,
      required: true,
    },
    nodeType: {
      type: String,
      required: true,
    },
  }
);

const tempData = mongoose.model("tempData", nodeSchema);

export default tempData;




