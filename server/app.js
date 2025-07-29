import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ruleRoutes from "./routes/rule.js";

dotenv.config();

const app = express();

// 1. Önce CORS - tüm metodlara izin ver
app.use(
  cors({
    origin: "http://localhost:5173", // client url
    credentials: true,
  })
);

// 2. Sonra JSON body parser
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));

// 3. Route'lardan önce istek loglama (test için)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 4. Route'lar

app.get("/deneme", (req, res) => res.send("Deneme çalışıyor"));
app.use("/rules", ruleRoutes);

const PORT = process.env.PORT || 5050;
const server = app
  .listen(PORT, () => console.log(`Server running on port ${PORT}`))
  .on("error", (err) => {
    console.error("❌ Server start error:", err);
  });

// Timeout'ları artır
server.timeout = 300000; // 5 dakika
server.keepAliveTimeout = 300000;
server.headersTimeout = 300000;
