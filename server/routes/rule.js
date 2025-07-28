// routes/rule.js
import express from "express";
import {
  editedRule,
  getRules,
  deleteRule,
  createdRule,
  uploadSqlFile,
} from "../controllers/ruleController.js";

const router = express.Router();



// file yükleme işlemleri için gelen dosyanın ayarlarının yapılması
import multer from "multer";


// bu dosya yolunda klasör varsa al yoksa yeni bir tane oluştur
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname + "-" + uniqueSuffix);
  },
});
const uploadPlace = multer({ storage });

router.get("/", getRules);
router.post("/edited", editedRule);
router.post("/deleted", deleteRule);
router.post("/created", createdRule);

// yeni bir sql dosyası alma
router.post("/upload-sql-file", uploadPlace.single("file"), uploadSqlFile);

export default router;
