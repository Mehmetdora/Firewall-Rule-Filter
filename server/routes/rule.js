// routes/rule.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

import {
  editedRule,
  getRules,
  deleteRule,
  createdRule,
  uploadSqlFile,
  analysisConflicts,
} from "../controllers/ruleController.js";

// Diğer route'lar
router.get("/", getRules);
router.post("/edited", editedRule);
router.post("/deleted", deleteRule);
router.post("/created", createdRule);

const upload = createMulterMiddlewareToSQLFile("uploads", ".sql", 800);
router.post("/upload-sql-file", upload.single("sqlfile"), uploadSqlFile);

router.post("/rules-conflict-analysis", analysisConflicts);

// Multer Oluşturma Fonk.
// fileDestination: "/uploads" , fileExtention : ".sql", fileMaxSize:200 gibi
function createMulterMiddlewareToSQLFile(
  fileDestination,
  fileExtention,
  fileMaxSize
) {
  // uploads klasörü yoksa oluştur
  const uploadDir = fileDestination;
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  // Multer konfigürasyonu
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext);
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${baseName}-${uniqueSuffix}${ext}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== fileExtention) {
      return cb(new Error("Sadece .sql dosyaları yüklenebilir."));
    }
    cb(null, true);
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: fileMaxSize * 1024 * 1024, // 200MB sınır
    },
  });

  return upload;
}

export default router;
