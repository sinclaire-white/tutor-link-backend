import express, { Application } from "express";
import dotenv from 'dotenv';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Load environment variables
dotenv.config();

// middleware
app.use(express.json());

// routes
app.get("/", (req, res) => {
  res.send("Hello, TutorLink!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});