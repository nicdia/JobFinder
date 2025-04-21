import { Request, Response } from "express";
import { createUser } from "../services/registerService";
import { handleLogin } from "../services/loginService";

export async function registerUser(req: Request, res: Response) {
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
}

export async function loginUser(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    const token = await handleLogin(email, password);
    res.json({ token });
  } catch (err: any) {
    console.error("❌ Fehler beim Login:", err);
    if (err.message === "invalid_credentials") {
      return res.status(401).json({ error: "Ungültige Anmeldedaten" });
    }
    res.status(500).json({ error: "Interner Serverfehler" });
  }
}
