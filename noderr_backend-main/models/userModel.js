import mongoose from "mongoose";
import jwt from "jsonwebtoken";
const Schema = mongoose.Schema;
import voucher_codes from "voucher-code-generator";
import ErrorHandler from "../utils/ErrorHandler.js";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: false,
    },
    lastName: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    profilePic: {
      type: String,
      required: false,
    },
    walletAddress: {
      type: String,
      required: [true, "Wallet Address is required"],
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
      required: false,
      default: 0,
    },
    referralCode: { type: String, unique: true, default: null },
    referredBy: { type: Schema.Types.ObjectId, ref: "User" },
    referredUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    usedReferralCode: { type: String, default: null },
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

userSchema.pre("save", function (next) {
  if (!this.referralCode) {
    console.log("Generating new referral code...");
    const codeGenerated = voucher_codes.generate({
      length: 8,
      count: 1,
      charset: voucher_codes.charset("alphanumeric"),
    });
    this.referralCode = codeGenerated[0];
    console.log(`Referral code generated: ${this.referralCode}`);
  }
  next();
});

userSchema.methods.getJwtToken = function () {
  console.log(`Generating JWT for user ${this._id}`); // Log user ID during token generation

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not defined in the environment variables.");
    throw new Error("JWT_SECRET is required to generate JWT tokens.");
  }

  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_COOKIE_EXPIRE || '1h', // Default expiration if not set
  });
};

userSchema.methods.generateReferralLink = function () {
  const referralLink = `https://noderr.xyz/signup?ref=${this.referralCode}`;
  console.log(`Generated referral link: ${referralLink}`);
  return referralLink;
};

userSchema.methods.rewardForReferral = function () {
  console.log(
    `Rewarding user ${this._id} for referral. Total referrals before: ${this.totalReferrals}`
  );
  this.totalReferrals += 1;
  this.successfulReferrals += 1;
  return this.save();
};

userSchema.statics.activateReferral = async function (referralCode, newUser) {
  console.log(`Activating referral with code: ${referralCode}`);
  const referringUser = await this.findOne({ referralCode });

  if (referringUser) {
    console.log(`Referral successful. Referring user ID: ${referringUser._id}`);
    newUser.referredBy = referringUser._id;
    referringUser.referredUsers.push(newUser._id);

    await referringUser.rewardForReferral(); // Reward the referring user for successful referrals

    await Promise.all([newUser.save(), referringUser.save()]);
  } else {
    console.log("Invalid referral code. No referring user found.");
  }
};

const User = mongoose.model("User", userSchema);
export default User;
