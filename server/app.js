import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// 1. Önce CORS - tüm metodlara izin ver
app.use(
  cors({
    origin: "http://localhost:5173", // Vite dev server URL
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 2. Sonra JSON body parser
app.use(express.json());

// 3. Route'lardan önce istek loglama (test için)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 4. Route'lar
import ruleRoutes from "./routes/rule.js";

app.get("/deneme", (req, res) => res.send("Deneme çalışıyor"));
app.use("/rules", ruleRoutes);

const PORT = process.env.PORT || 5050;
app
  .listen(PORT, () => console.log(`Server running on port ${PORT}`))
  .on("error", (err) => {
    console.error("❌ Server start error:", err);
  });
