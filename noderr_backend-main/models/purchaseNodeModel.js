import mongoose from "mongoose";

const Schema = mongoose.Schema;

const purchaseNodeSchema = new Schema(
  {
    node: {
      type: Schema.Types.ObjectId,
      ref: "Node",
    },
    durationMonths: {
      type: Number,
      required: true,
    },
    purchaseDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
    },
    price: {
      type: Number,
      required: true,
    },

    // location: {
    //   type: {
    //     type: String,
    //     enum: ["Point"],
    //     default: "Point",
    //   },
    //   coordinates: {
    //     type: [Number],
    //     required: true,
    //   },
    // },
    // promotion: {
    //   code: { type: String },
    //   discountPercentage: { type: Number },
    // },
  },
  {
    timestamps: true,
  }
);
const purchaseSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    purchaseNodes: [purchaseNodeSchema],
  },
  {
    timestamps: true,
  }
);
// purchaseNodeSchema.pre("save", function (next) {
//   this.expiryDate = new Date(this.purchaseDate);
//   this.expiryDate.setMonth(this.expiryDate.getMonth() + this.durationMonths);
//   next();
// });

const PurchaseNode = mongoose.model("PurchaseNode", purchaseSchema);
export default PurchaseNode;
