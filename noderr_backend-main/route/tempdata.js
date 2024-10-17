import express from "express"
import { authorizeRoles, isAuthenticated } from "../middleware/Auth.js";
import { createTempData } from "../controller/tempData.js";

const router = express.Router();

router.route("/create-tempNode").post(
  isAuthenticated,
  createTempData
);

export default router;

