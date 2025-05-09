import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jobRoutes from "./routes/allJobs.route";
import accessibleJobs from "./routes/userVisibleJobs.route";
import register from "./routes/userAuth.route";
import login from "./routes/userAuth.route";
import userRoutes from "./routes/userManagement.route";
import userDrawRequestRoute from "./routes/userInputGeometry.route";
import userSearchRequestRoute from "./routes/userInputSearchRequest.route";

dotenv.config();
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use("/api/auth", register);
app.use("/api/auth", login);
app.use("/api/users", userRoutes);
app.use("/api", jobRoutes);
app.use("/api", accessibleJobs);
app.use("/api", userDrawRequestRoute);
app.use("/api", userSearchRequestRoute);

app.listen(PORT, () => {
  console.log(`✅ Server läuft unter http://localhost:${PORT}`);
});

export default app;
