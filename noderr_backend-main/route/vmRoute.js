
import express from "express";
import { isAuthenticated } from "../middleware/Auth.js";
import { getUserPurchaseNodes } from "../controller/vmController.js";

const router = express.Router();

router.get("/get-user-purchase-nodes", isAuthenticated, getUserPurchaseNodes);

export default router;
