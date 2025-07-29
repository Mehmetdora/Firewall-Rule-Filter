// routes/rule.js
import express from "express";
import Busboy from "busboy";
import path from "path";
import fs from "fs";

import {
  editedRule,
  getRules,
  deleteRule,
  createdRule,
  uploadSqlFile,
} from "../controllers/ruleController.js";

const router = express.Router();

router.get("/", getRules);
router.post("/edited", editedRule);
router.post("/deleted", deleteRule);
router.post("/created", createdRule);

function parseMultipartData(req, res, next) {
  console.log("=== MULTIPART PARSING ===");

  const contentType = req.headers["content-type"];
  if (!contentType || !contentType.includes("multipart/form-data")) {
    return res
      .status(400)
      .json({ error: "Content-Type multipart/form-data olmalı" });
  }

  // Boundary'yi çıkar
  const boundary = "--" + contentType.split("boundary=")[1];
  console.log("Boundary:", boundary);

  let buffer = Buffer.alloc(0);
  let fileData = null;
  let fileName = null;

  req.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
  });

  req.on("end", () => {
    try {
      const data = buffer.toString("binary");
      const parts = data.split(boundary);

      for (let part of parts) {
        if (
          part.includes("Content-Disposition: form-data") &&
          part.includes("filename=")
        ) {
          // Filename'i çıkar
          const filenameMatch = part.match(/filename="([^"]+)"/);
          if (filenameMatch) {
            fileName = filenameMatch[1];
            console.log("Dosya adı:", fileName);

            // SQL kontrolü
            if (!fileName.endsWith(".sql")) {
              return res
                .status(400)
                .json({ error: "Sadece SQL dosyalarına izin verilir" });
            }

            // Dosya içeriğini çıkar
            const contentStart = part.indexOf("\r\n\r\n") + 4;
            const contentEnd = part.lastIndexOf("\r\n");
            fileData = part.substring(contentStart, contentEnd);

            // Dosyayı kaydet
            const uploadDir = path.join(process.cwd(), "uploads");
            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
            }

            const filePath = path.join(uploadDir, `${Date.now()}-${fileName}`);
            fs.writeFileSync(filePath, fileData, "binary");

            console.log("Dosya kaydedildi:", filePath);

            // req.file oluştur (multer formatında)
            req.file = {
              originalname: fileName,
              filename: path.basename(filePath),
              path: filePath,
              size: fs.statSync(filePath).size,
            };

            break;
          }
        }
      }

      if (!req.file) {
        return res.status(400).json({ error: "Dosya bulunamadı" });
      }

      next();
    } catch (error) {
      console.error("Parse error:", error);
      res.status(400).json({ error: "Dosya parse edilemedi" });
    }
  });

  req.on("error", (error) => {
    console.error("Request error:", error);
    res.status(400).json({ error: "Request hatası" });
  });
}

router.post("/upload-sql-file", parseMultipartData, uploadSqlFile);

export default router;
