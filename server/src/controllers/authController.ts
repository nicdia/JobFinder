// src/controllers/authController.ts
import { Request, Response } from "express";
import { createUser } from "../services/userRegisterService";
import { handleLogin } from "../services/userLoginService";

export async function registerUser(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Email und Passwort sind erforderlich." });
  }

  try {
    await createUser(email, password);

    // Direkt einloggen nach erfolgreicher Registrierung:
    const result = await handleLogin(email, password);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error("❌ Fehler bei der Registrierung:", err);

    // Vorab-Check aus Service
    if (err?.code === "EMAIL_TAKEN" || err?.status === 409) {
      return res.status(409).json({ error: "Email bereits registriert." });
    }

    // Fallback: Unique-Constraint aus der DB (z. B. Postgres)
    if (err?.code === "23505") {
      return res.status(409).json({ error: "Email bereits registriert." });
    }

    return res.status(500).json({ error: "Serverfehler" });
  }
}

export async function loginUser(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    const result = await handleLogin(email, password);
    console.log("Login result:", result);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error("❌ Fehler beim Login:", err);
    if (err.message === "invalid_credentials") {
      return res.status(401).json({ error: "Ungültige Anmeldedaten" });
    }
    return res.status(500).json({ error: "Interner Serverfehler" });
  }
}
