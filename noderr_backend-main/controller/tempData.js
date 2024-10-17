import ErrorHandler from "../utils/ErrorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";
import tempData from "../models/tempData.js";
import { encryptObject } from "../utils/encrypt.js";
const createTempData = TryCatch(async (req, res, next) => {
  const { amount, nodeId, duration, privateKey, rpcUrl, nodeType } = req.body;
  const encryptedPrivateKey = encryptObject(privateKey, "secretKey");
  const temp = await tempData.create({
    amount,
    nodeId,
    duration,
    privateKey: encryptedPrivateKey,
    rpcUrl,
    nodeType,
  });

  const newTempData = await temp.save();

  res.status(201).json({
    success: true,
    data: {
      newTempData,
    },
  });
}
);

const getTempData = TryCatch(async (req, res, next) => {
  const temp = await tempData.find();
  res.status(200).json({
    status: "success",
    data: {
      temp,
    },
  });
}
);

//delete
const deleteTempData = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const temp = await tempData.findByIdAndDelete(id);
  if (!temp) {
    return next(new ErrorHandler("Temp data not found", 404));
  }
  res.status(200).json({
    status: "success",
    message: "Temp data deleted successfully",
  });
}
);


export { createTempData, getTempData, deleteTempData };