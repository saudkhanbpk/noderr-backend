import Vm from "../models/vmModel.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";

const getUserPurchaseNodes = TryCatch(async (req, res, next) => {
  const userId = req.user.id;
  const userPurchaseNodes = await Vm.find({ user_id: userId, is_attached: true }).populate("nodeKey");
  if (!userPurchaseNodes) {
    return next(new ErrorHandler("No purchase found", 404));
  }

  res.status(200).json({
    success: true,
    data: userPurchaseNodes,
  });
});

export { getUserPurchaseNodes }