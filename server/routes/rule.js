// routes/rule.js
import express from "express";
import multer from "multer";
const router = express.Router();

import {
  editedRule,
  getRules,
  deleteRule,
  createdRule,
  uploadSqlFile,
} from "../controllers/ruleController.js";

// Diğer route'lar
router.get("/", getRules);
router.post("/edited", editedRule);
router.post("/deleted", deleteRule);
router.post("/created", createdRule);

/* 

exec ile nodejs içinde terminal üzerinde çalıştırmak istediğimiz ama nodejs ile bu işlemleri
otomatik hale getimek istediğimiz tüm işlemleri yapabiliz. 

ilk aldığı parametre terminalde çalıştırmak istediğimiz komuttur. command olarak fonksiyona verilir. 

- exec asenkron bir fonksiyondur. Yani komutun sonucu hemen gelmez. Sonuç geldiğinde çalışması için bir callback function verilmelidir.

sonrasında callback fonk yazılır exec(commands, (err,stdout,stderr) => { kodlar });
burada err => komut başarısız olursa buradan hatalar alınır. 
stdout => komutun doğru çalışması halinde alınacak olan sonuçlardır. 
stderr => komutun çalıştırılması halinde komut tarafında alınacak olan hatalar buradan kontrol edilir. 



projede kullanılacak olan command değeri => 'const command = `psql -U postgres -d veritabanim -c "SELECT * FROM tablo_adi"`;' şekilden olabilir. 

Genel kullanım şekli;
-------
exec(command, (err, stdout, stderr) => {
  if (err) {
    console.error("Komut hatası:", err.message);
    return;
  }

  if (stderr) {
    console.error("stderr:", stderr);
    return;
  }

  console.log("Tablodan gelen veriler:");
  console.log(stdout);
});
------


Bu konuda benzer şekilde çalışan 'spawn' paketi de vardır. Bu paket ile daha uzun süren işlemler yapılır ama exec ile daha basit işlemler yapılır. Spawn kullanırken callback fonk. ları bulunmaz , bu nedenle kontroller süreç boyunca yapılır. 


Örnek spawn kullanımı;

------
const child = spawn('psql', ['-U', 'postgres', '-d', 'veritabanim', '-c', 'SELECT * FROM tablo_adi']);

child.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

child.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

child.on('close', (code) => {
  console.log(`Process kapandı. Çıkış kodu: ${code}`);
});
------



*/

import { exec, spawn } from "child_process";
import path from "path";
import fs from "fs";

// uploads klasörü yoksa oluştur
const uploadDir = "uploads";
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
  if (ext !== ".sql" && ext !== ".dump") {
    return cb(new Error("Sadece .sql veya .dump dosyaları yüklenebilir."));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB sınır
  },
});

router.post("/upload-sql-file", upload.single("sqlfile"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Dosya yüklenmedi." });
  }

  console.log("ROUTE FOR UPLOAD ", req.file);
  const filePath = req.file.path;
  const ext = path.extname(req.file.originalname).toLowerCase();
  console.log("ext ==", ext);
  const fullPath = path.resolve(filePath);
  console.log("FILE FULL PATH: ", fullPath);

  console.log("=== Sql command start ===");

  /* 
  -U : kullanıcı adı , veritabanının
  -d : bağlanılacak veritabanı 
  -c : çalıştırılacak komut
  */
  const command =
    'psql -U postgres -d postgres -c "SELECT * FROM \\"public\\".\\"tb_guvenlikKurallari\\""';

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error("===> Komut hatası:", err.message);
      return;
    }

    if (stderr) {
      console.error("===> stderr:", stderr);
      return;
    }

    console.log("===> Tablodan gelen veriler:");
    console.log(stdout);
  });

  // Komut seçimleri
  /* const isDump = ext === ".dump";
  const command = isDump
    ? "/opt/homebrew/opt/postgresql@15/bin/pg_restore"
    : "psql";

  const args = isDump
    ? [
        "-h",
        process.env.DB_HOST,
        "-U",
        process.env.DB_USER,
        "-d",
        process.env.DB_NAME,
        "-v",
        "-f",
        filePath,
      ]
    : [
        "-h",
        process.env.DB_HOST,
        "-U",
        process.env.DB_USER,
        "-d",
        process.env.DB_NAME,
        "-f",
        filePath,
      ];

  const env = {
    ...process.env,
    PGPASSWORD: process.env.DB_PASSWORD || "",
  };

  try {
    console.log("COMMANND ====", command, args);
    const child = exec(command, args, { env });

    const abc = exec (command, (out, err) => {
      if (err)

      out
    })

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    console.log("chil.d", stderr, stdout);
    child.on("close", (code) => {
      // Dosyayı sil
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      if (code === 0) {
        return res.json({
          message: "SQL dosyası başarıyla çalıştırıldı.",
          output: stdout,
        });
      } else {
        return res.status(500).json({
          error: "Veritabanı komutu hatası",
          details: stderr,
        });
      }
    });
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return res
      .status(500)
      .json({ error: "İşlenemedi", details: error.message });
  } */
});

/* router.post("/upload-sql-file", upload.single("sqlfile"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Dosya bulunamadı" });
  }

  console.log("=== DOSYA ALINDI ===");
  console.log("- İsim:", req.file.originalname);
  console.log("- Boyut:", Math.round(req.file.size / 1024 / 1024) + "MB");

  uploadSqlFile(req, res);
}); */

export default router;
