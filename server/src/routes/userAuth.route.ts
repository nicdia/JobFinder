import { Router } from "express";
import { registerUser, loginUser } from "../controllers/authController";

const router = Router();

router.post("/login", loginUser as any);

router.post("/register", registerUser as any);

export default router;
