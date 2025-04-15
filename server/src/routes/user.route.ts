import { Router } from "express";
import pool from "../utils/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUser } from "../services/user.service";

const router = Router();

router.post("/register", async (req: any, res: any) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Email und Passwort sind erforderlich." });
  }

  try {
    const user = await createUser(email, password);
    res.status(201).json(user);
  } catch (err: any) {
    console.error("❌ Fehler bei der Registrierung:", err);
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email bereits registriert." });
    }
    res.status(500).json({ error: "Serverfehler" });
  }
});

export default router;
