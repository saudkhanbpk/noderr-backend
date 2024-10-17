import PromotionCode from "../models/promotionCodeModel.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";
import voucher_codes from "voucher-code-generator";
const createPromotionCode = TryCatch(async (req, res, next) => {

  const { discountPercentage, maxUsage, expiryDate } = req.body

  const codeGenerated = voucher_codes.generate({
    length: 8,
    count: 1,
    charset: voucher_codes.charset("alphanumeric"),
  });
  console.log("code ;", req.body?.code)
  let newCode = req.body?.code ? req.body.code : codeGenerated[0]
  console.log("code ;", newCode)
  try {
    const promotionCode = await PromotionCode.create({
      code: newCode,
      discountPercentage, maxUsage, expiryDate
    });

    res.status(201).json({
      status: "success",
      data: {
        promotionCode,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

const updatePromotionCode = TryCatch(async (req, res, next) => {
  const { code } = req.params;
  const { discountPercentage, maxUsage, expiryDate } = req.body;
  if (!discountPercentage || !maxUsage || !expiryDate) {
    return next(
      new ErrorHandler("Discount Percentage and Max Usage is required", 400)
    );
  }
  // const expiryDate = new Date();
  // expiryDate.setDate(expiryDate.getDate() + 30);
  const promotionCode = await PromotionCode.findByIdAndUpdate(
    { _id: code },
    {
      discountPercentage,
      maxUsage,
      expiryDate,
    },
    {
      new: true,
    }
  );
  if (!promotionCode) {
    return next(new ErrorHandler("Promotion Code not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      promotionCode,
    },
  });
});

const availPromotionCode = TryCatch(async (req, res, next) => {
  const { code } = req.body;
  const userId = req.user.id; // Assuming the user ID is available in req.user

  try {
    const codeDetails = await PromotionCode.findOne({ code: code });

    if (!codeDetails) {
      return res.status(404).json({
        success: false,
        message: "Promotion code not found",
      });
    }

    if (codeDetails.maxUsage === 0) {
      return next(new ErrorHandler("promotion code under processing", 400));
    }
    if (codeDetails.currentUsage >= codeDetails.maxUsage) {
      return next(new ErrorHandler("Promotion code usage limit reached", 400));
    }

    if (codeDetails.expiryDate < new Date()) {
      return next(new ErrorHandler("Promotion code expired", 400));
    }

    // Check if the user has already availed this promotion
    if (codeDetails.userAvailed.includes(userId)) {
      return next(new ErrorHandler("Promotion code already availed", 400));
    }

    // Apply the discount to the user's transaction
    // Your logic to apply the discount goes here

    // Increment the usage count for the promotion code
    codeDetails.currentUsage += 1;

    // Add the user to the list of users who have availed this promotion
    codeDetails.userAvailed.push(userId);

    await codeDetails.save();

    res.status(200).json({
      success: true,
      message: "Promotion code applied successfully",
      data: {
        codeDetails,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

const deletePromotionCode = TryCatch(async (req, res, next) => {
  const { code } = req.params;
  const promotionCode = await PromotionCode.findByIdAndDelete({ _id: code });
  if (!promotionCode) {
    return next(new ErrorHandler("Promotion Code not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      promotionCode,
    },
  });
});

const getAllPromotionCode = TryCatch(async (req, res, next) => {
  const promotionCodes = await PromotionCode.find();
  res.status(200).json({
    status: "success",
    data: {
      promotionCodes,
    },
  });
});
export { createPromotionCode, updatePromotionCode, availPromotionCode, deletePromotionCode, getAllPromotionCode };
