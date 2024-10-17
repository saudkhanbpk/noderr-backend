import mongoose from "mongoose";

const Schema = mongoose.Schema;

const nodeSchema = new Schema(
  {
    nodeName: {
      type: String,
      required: true,
      unique: true,
    },
    nodePrice: {
      type: Object,
      required: true,
    },
    nodeImage: {
      public_id: {
        type: String,
        required: true,
        default: "3292||stalah",
      },
      url: {
        type: String,
        required: true,
        default:
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Fpixabay.com%2Fvectors%2Fblank-profile-picture-mystery-man-973460%2F&psig=AOvVaw3yZ4ihZhlPWhab5e20wjxe&ust=1681274559120000&source=images&cd=vfe&ved=0CBEQjRxqFwoTCMif9PeBof4CFQAAAAAdAAAAABAE",
      },
    },
    slots: {
      type: Number,
      required: true,
      default: 0,
    },
    bgColor: {
      type: String,
      default: 'blue'
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

const Node = mongoose.model("nodes", nodeSchema);

export default Node;
