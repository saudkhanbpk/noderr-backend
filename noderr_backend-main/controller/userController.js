import User from "../models/userModel.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";
import sendToken from "../utils/sendToken.js";
import emailValidator from "email-validator";
import googleKeys from "../google-service.json" assert { type: "json" };
import { google } from "googleapis";

// Register or login a user
const registerOrLoginUser = TryCatch(async (req, res, next) => {
  const { userWallet, referralCode } = req.body;
  console.log("Register or login request received:", req.body);

  const walletAddress = userWallet.toLowerCase().trim();

  console.log("Looking for user with wallet address:", walletAddress);
  const user = await User.findOne({ walletAddress });

  if (user) {
    console.log("User found. Logging in...");
    return sendToken(user, 200, res); // Send JWT token for authentication
  }

  if (referralCode) {
    console.log("Referral code provided:", referralCode);
    const refferedCode = await User.findOne({ referralCode });
    if (!refferedCode) {
      console.log("Invalid referral code.");
      return next(new ErrorHandler("Invalid referral code", 400));
    }
  }

  console.log("Creating a new user...");
  const newUser = await User.create({
    walletAddress,
    usedReferralCode: referralCode,
  });

  if (referralCode) {
    console.log("Activating referral for new user...");
    await User.activateReferral(referralCode, newUser, next);
    newUser.usedReferralCode = referralCode;
    await newUser.save();
  }

  console.log("Sending token to new user...");
  return sendToken(newUser, 200, res);
});

// Logout user
const logOutUser = TryCatch(async (req, res) => {
  console.log("Logging out user...");
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});

// Get user profile
const getUserProfile = TryCatch(async (req, res, next) => {
  console.log("Fetching user profile for user ID:", req.user.id);
  const user = await User.findById(req.user.id);

  if (!user) {
    console.log("User not found.");
    return next(new ErrorHandler("User not found", 404));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// Sign up for beta launch
const signupForBetaLaunch = TryCatch(async (req, res) => {
  console.log("Signing up for beta launch with email:", req.body.email);

  const sheetId = "1ojoH_iDP42kdPSZde0bkAWNe4GdeUzKkskRTbIkGrcQ";
  const SCOPES = [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/spreadsheets",
  ];
  const auth = new google.auth.JWT(
    googleKeys.client_email,
    null,
    googleKeys.private_key,
    SCOPES
  );

  const values = [[req.body.email]];
  const sheet = google.sheets({ version: "v4", auth });

  const resource = {
    values,
  };

  const added = await sheet.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "Emails!A1",
    valueInputOption: "RAW",
    resource,
  });

  res.status(200).json({
    success: true,
    data: added,
  });
});

// Update user profile
const updateUserProfile = TryCatch(async (req, res, next) => {
  console.log("Updating user profile for user ID:", req.user.id);
  const user = await User.findById(req.user.id);

  if (!user) {
    console.log("User not found.");
    return next(new ErrorHandler("User not found", 404));
  }
  if (req.file) {
    console.log("Profile picture uploaded:", req.file);
    user.profilePic = req.file.filename;
  }

  // Dynamically update fields from the request body
  for (const [key, value] of Object.entries(req.body)) {
    if (key === "email") {
      console.log("Validating email:", value);
      if (!emailValidator.validate(value)) {
        return next(new ErrorHandler("Invalid email address", 400));
      }
    }

    console.log(`Updating ${key} with value: ${value}`);
    user[key] = value;
  }

  const updatedUser = await user.save();

  console.log("User profile updated successfully.");
  res.status(200).json({
    success: true,
    updatedUser,
  });
});

export {
  registerOrLoginUser,
  logOutUser,
  updateUserProfile,
  getUserProfile,
  signupForBetaLaunch,
};
