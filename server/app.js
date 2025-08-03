import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ruleRoutes from "./routes/rule.js";

import {
  createdRule,
  deleteRule,
  editedRule,
  getRules,
} from "./controllers/ruleController.js";

dotenv.config();
const app = express();

// 1. CORS

/* app.use((req, res, next) => {
  // upload url'inde ayarları değiştir
  if (req.url.includes("upload")) {
    // TCP optimizasyonları
    req.socket.setNoDelay(true);
    req.socket.setKeepAlive(true);
    req.socket.setTimeout(900000); // 5 dakika timeout

    // Buffer size artır
    req.socket.setMaxListeners(0);
  }
  next();
}); */

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));

// 4. Routes
app.get("/deneme", (req, res) => res.send("Deneme çalışıyor"));
app.use("/rules", ruleRoutes);

const PORT = process.env.PORT || 5050;
const server = app
  .listen(PORT, () => console.log(`Server running on port ${PORT}`))
  .on("error", (err) => {
    console.error("❌ Server start error:", err);
  });

/* server.timeout = 900000;  // 15 dk
server.keepAliveTimeout = 900000;
server.headersTimeout = 900000; */
