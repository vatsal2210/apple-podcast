import express from "express";
import cors from "cors";
import routes from "./routes/index";
import connectDB from "./config/database";

const app = express();

// Connect Database
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/api", routes);

export default app;
