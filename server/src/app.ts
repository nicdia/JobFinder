import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jobRoutes from "./routes/jobs.route";
import accessibleJobs from "./routes/accessibleJobs.route";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", jobRoutes);
app.use("/api", accessibleJobs);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Server läuft unter http://localhost:${PORT}`);
});
