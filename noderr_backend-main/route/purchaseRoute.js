import express from "express";
import {
  getPurchaseNodes,
  purchaseNode,
  renewPurchaseNode,
  // purchaseNodeWithPromoCode,
  checkNodeBeforePurchase
} from "../controller/purchaseController.js";
import { isAuthenticated } from "../middleware/Auth.js";
const router = express.Router();
router.post("/checkNodeBeforePurchase", checkNodeBeforePurchase)
router.post("/purchase-node", purchaseNode);
// router.post("/purchase-node-with-promo-code/:id", isAuthenticated, purchaseNodeWithPromoCode);
router.get("/purchase-nodes", isAuthenticated, getPurchaseNodes);
router
  .post("/renew-purchase-node/:id")
  .put(isAuthenticated, renewPurchaseNode);

// router.post("/purchase-node", purchaseNode);

export default router;
