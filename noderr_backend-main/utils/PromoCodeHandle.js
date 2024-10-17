import PromotionCode from "../models/promotionCodeModel.js";

export const checkAvailPromoCode = async (code, userId) => {
  try {
    const codeDetails = await PromotionCode.findOne({ code: code });

    if (!codeDetails) {
      return res.status(404).json({
        success: false,
        message: "Promotion code not found",
      });
    }

    if (codeDetails.maxUsage === 0) {
      return {
        success: false,
        message: "promotion code under processing",
      };
    }
    if (codeDetails.currentUsage >= codeDetails.maxUsage) {
      return {
        success: false,
        message: "Promotion code usage limit reached",
      };
    }

    if (codeDetails.expiryDate < new Date()) {
      return {
        success: false,
        message: "Promotion code expired",
      };
    }

    // Check if the user has already availed this promotion
    if (codeDetails.userAvailed.includes(userId)) {
      return {
        success: false,
        message: "Promotion code already availed",
      };
    }

    // Apply the discount to the user's transaction
    // Your logic to apply the discount goes here

    // Increment the usage count for the promotion code
    codeDetails.currentUsage += 1;

    // Add the user to the list of users who have availed this promotion
    codeDetails.userAvailed.push(userId);

    await codeDetails.save();

    return { status: true, message: "Promotion code availed" };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};
