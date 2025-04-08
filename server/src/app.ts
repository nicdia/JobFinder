import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db";
import jobRoutes from "./routes/jobs.route"; // ⬅️ Import

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", jobRoutes);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Server läuft unter http://localhost:${PORT}`);
});
