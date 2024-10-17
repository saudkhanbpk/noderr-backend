import express from "express";
import {
  availPromotionCode,
  createPromotionCode,
  deletePromotionCode,
  getAllPromotionCode,
  updatePromotionCode,
} from "../controller/promotionalCodeController.js";
import { authorizeRoles, isAuthenticated } from "../middleware/Auth.js";
import { upload } from "../helper/imageUpload.js";
const router = express.Router();

router
  .route("/generate-promotion-code")
  .post(isAuthenticated, authorizeRoles("admin"), createPromotionCode);
router
  .route("/update-promotion-code/:code")
  .patch(isAuthenticated, authorizeRoles("admin"), upload.any(), updatePromotionCode);
router.route("/apply-promotion-code").put(isAuthenticated, availPromotionCode);
router
  .route("/delete-promotion-code/:code")
  .delete(deletePromotionCode);
router.route("/get-all-promo-codes").get(isAuthenticated, authorizeRoles("admin"), getAllPromotionCode);

export default router;
