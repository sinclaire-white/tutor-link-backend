import express, { Application } from "express";
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import { CategoryRoutes } from "./modules/category/category.router";
import { TutorRoutes } from "./modules/tutor/tutor.router";

const app: Application = express();

app.use(cors({
    origin: process.env.APP_URL || "http://localhost:5000",
    credentials: true,
}));

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.use("/api/categories", CategoryRoutes);
app.use("/api/tutors", TutorRoutes);




app.get("/", (req, res) => {
  res.send("Hello, World!");
});
export default app;