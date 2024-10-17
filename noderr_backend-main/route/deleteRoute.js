import express from "express";
import { deleteNode } from "../controller/deleteVmController.js";
const router = express.Router();

router.post("/delete-node", deleteNode);

export default router;
