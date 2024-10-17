import express from "express"
import { authorizeRoles, isAuthenticated } from "../middleware/Auth.js";
import { createAddFaq, deleteAddFaq, getAddFaq, updateAddFaq } from "../controller/addFaqController.js";
const router = express.Router();

router.route("/create-faq").post(isAuthenticated, authorizeRoles("admin"), createAddFaq)
router.route("/get-faq").get(isAuthenticated, getAddFaq)
router.route("/update-faq/:id").patch(isAuthenticated, authorizeRoles("admin"), updateAddFaq)
router.route("/delete-faq/:id").delete(isAuthenticated, authorizeRoles("admin"), deleteAddFaq)

export default router;

