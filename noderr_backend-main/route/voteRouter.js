import exppres from "express";
import {
  casteVoteByUser,
  createPool,
  deletePoll,
  getPolls,
  getSinglePoll,
  updatePoll,
  userVote,
} from "../controller/voteController.js";
import { authorizeRoles, isAuthenticated } from "../middleware/Auth.js";
import { upload } from "../helper/imageUpload.js";

const router = exppres.Router();

router
  .route("/create-poll")
  .post(isAuthenticated, authorizeRoles("admin"), createPool);
router
  .route("/delete-poll/:id")
  .delete(isAuthenticated, authorizeRoles("admin"), deletePoll);
router
  .route("/update-poll/:id")
  .patch(isAuthenticated, authorizeRoles("admin"), upload.any(), updatePoll);

router.route("/casted-vote/:id").put(isAuthenticated, casteVoteByUser);
router
  .route("/get-poll/:id")
  .get(isAuthenticated, authorizeRoles("admin"), getSinglePoll);

router
  .route("/get-polls")
  .get(isAuthenticated, authorizeRoles("admin"), getPolls);
router.route("/user-vote/:id").get(isAuthenticated, userVote);

export default router;
