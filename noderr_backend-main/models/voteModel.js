import mongoose from "mongoose";

const Schema = mongoose.Schema;

const voteSchema = new Schema(
  {
    voteTitle: {
      type: String,
      required: true,
    },

    voteOptions: [{ type: String }],
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    votes: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        optionIndex: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);
const Vote = mongoose.model("Vote", voteSchema);
export default Vote;
