import { Router } from "express";
import pool from "../utils/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

router.post("/login", async (req: any, res: any) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM account.users WHERE email = $1",
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: "Ungültige Anmeldedaten" });
    }

    const user = result.rows[0];
    console.log(`this is req body before compare ${req.body}`);
    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      return res.status(401).json({ error: "Ungültige Anmeldedaten" });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "2h",
    });

    res.json({ token });
  } catch (err) {
    console.error("Fehler beim Login:", err);
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

export default router;
