import mongoose from "mongoose";

const Schema = mongoose.Schema;

const promotionCodeSchema = new Schema(
  {
    code: {
      type: String,
      unique: true,
      required: true,
    },
    discountPercentage: {
      type: Number,
      required: false,
    },
    maxUsage: {
      type: Number,
      required: false,
      default: 0,
    },
    currentUsage: {
      type: Number,
      default: 0,
    },
    expiryDate: {
      type: Date,
      required: false,
    },
    userAvailed: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const PromotionCode = mongoose.model("Promotion", promotionCodeSchema);
export default PromotionCode;
