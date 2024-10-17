import express from "express"
import { deleteNode, getAllNodes, getNode, launchNode, updateNode } from "../controller/nodeController.js";
import { authorizeRoles, isAuthenticated } from "../middleware/Auth.js";
import { upload } from "../helper/imageUpload.js";
const router = express.Router();
router.route("/launch-node").post(upload.single("myFile"), isAuthenticated, authorizeRoles("admin"), launchNode)
router.route("/update-node/:id").patch(upload.single("myFile"), isAuthenticated, updateNode)
router.route("/delete-node/:id").delete(upload.single("myFile"), isAuthenticated, authorizeRoles("admin"), deleteNode)
router.route("/get-node/:id").get(upload.single("myFile"), isAuthenticated, getNode)
router.route("/get-nodes").get(upload.single("myFile"), getAllNodes)


export default router;