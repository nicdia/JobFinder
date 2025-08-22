import express from "express";
import {
  updateUserController,
  deleteUserController,
} from "../controllers/userController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.patch("/:userId", authenticateToken, updateUserController);
// 👇 zusätzlich erlauben, falls Client PUT verwendet
router.put("/:userId", authenticateToken, updateUserController);

router.delete("/:userId", authenticateToken, deleteUserController);

export default router;
