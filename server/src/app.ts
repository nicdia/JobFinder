import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jobRoutes from "./routes/jobs.route";
import accessibleJobs from "./routes/accessibleJobs.route";
import register from "./routes/user.route";
import login from "./routes/auth.route";

dotenv.config();
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use("/api", jobRoutes);
app.use("/api", accessibleJobs);
app.use("/api/auth", register);
app.use("/api/auth", login);

app.listen(PORT, () => {
  console.log(`✅ Server läuft unter http://localhost:${PORT}`);
});
