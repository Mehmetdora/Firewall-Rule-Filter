import Joi from "joi";
import pool from "../DB/db.js";
import path from "path";
import { exec, execSync } from "child_process";
import {
  analysisRuleConflicts,
  deleteSQLFile,
} from "../services/conflictAnalyser.js";
import get_tb_guvenlikKurallari, {
  get_tb_guvenlikKurallari_gruplari,
  get_tb_protokoller,
  get_tb_servisTanimlari,
  get_tb_servisTanimlari_uyeler,
  createFullRule,
  get_tb_servis_atama,
} from "../services/getDataFromDB.js";

import dotenv from "dotenv";
dotenv.config();

const rules = []; // veritabanından alınan rule listesi
let sqlFileFullPath = "";

export async function getRules(req, res) {
  // rules verilerini db den al

  try {
    // sorgular yazılırken her tablo ismi için çift tırnak kullanılmalı
    const result = await pool.query(
      'SELECT * FROM "public"."tb_guvenlikKurallari"'
    ); // tablonun adını değiştir

    console.log("Firewall Rule kayıtları veritabanında alındı (getRules)");
    res.json({ message: "Rules fetched successfully", rules: result.rows });
  } catch (err) {
    console.error("Veri alınırken hata oluştu:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
}
export function createdRule(req, res) {
  // validation işlemleri

  const schema = Joi.object({
    title: Joi.string().required(),
    message: Joi.string().required(),
    kaynak_guvenlikbolgesi: Joi.object({
      value: Joi.string().required(),
      isChecked: Joi.boolean().required(),
    }).required(),
    hedef_guvenlikbolgesi: Joi.object({
      value: Joi.string().required(),
      isChecked: Joi.boolean().required(),
    }).required(),
    kaynak_adresi: Joi.object({
      value: Joi.string().required(),
      isChecked: Joi.boolean().required(),
    }).required(),
    hedef_adresi: Joi.object({
      value: Joi.string().required(),
      isChecked: Joi.boolean().required(),
    }).required(),
    servisler: Joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    console.log("Validation error:", error.details);
    return res.status(400).json({ errorMsg: error.details });
  }

  console.log("Validated Body:", value);

  let newRule = {
    title: "",
    message: "",
    time: "",
    kaynak_guvenlikbolgesi: "",
    hedef_guvenlikbolgesi: "",
    kaynak_adresi: "",
    hedef_adresi: "",
    servisler: "",
  };

  newRule.title = value.title;
  newRule.message = value.message;
  newRule.time = "3 weeks ago";
  newRule.kaynak_guvenlikbolgesi = value.kaynak_guvenlikbolgesi;
  newRule.hedef_guvenlikbolgesi = value.hedef_guvenlikbolgesi;
  newRule.kaynak_adresi = value.kaynak_adresi;
  newRule.hedef_adresi = value.hedef_adresi;
  newRule.servisler = value.servisler;

  rules.push(newRule);
  console.log("yeni rules listesi:" + rules);

  return res.status(200).json({ message: "Kural başarıyla eklendi." });
}
export function editedRule(req, res) {
  const schema = Joi.object({
    id: Joi.number().required(),
    title: Joi.string().required(),
    message: Joi.string().required(),
    time: Joi.string().required(),
    kaynak_guvenlikbolgesi: Joi.object({
      value: Joi.string().required(),
      isChecked: Joi.boolean().required(),
    }).required(),
    hedef_guvenlikbolgesi: Joi.object({
      value: Joi.string().required(),
      isChecked: Joi.boolean().required(),
    }).required(),
    kaynak_adresi: Joi.object({
      value: Joi.string().required(),
      isChecked: Joi.boolean().required(),
    }).required(),
    hedef_adresi: Joi.object({
      value: Joi.string().required(),
      isChecked: Joi.boolean().required(),
    }).required(),
    servisler: Joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    console.log("Validation error:", error.details);
    return res.status(400).json({ error: error.details });
  }

  console.log("Validated Body:", value);

  var rule = rules.find((r) => r.id === value.id);
  if (rule) {
    rule.title = value.title;
    rule.message = value.message;
    rule.time = value.time;
    rule.kaynak_guvenlikbolgesi = value.kaynak_guvenlikbolgesi;
    rule.hedef_guvenlikbolgesi = value.hedef_guvenlikbolgesi;
    rule.kaynak_adresi = value.kaynak_adresi;
    rule.hedef_adresi = value.hedef_adresi;
    rule.servisler = value.servisler;
  } else {
    res.status(404).json({ error: "Rule not found" });
    return;
  }

  return res.status(200).json({ message: "Kural başarıyla düzenlendi." });
}
export function deleteRule(req, res) {
  console.log("Delete request body:", req.body);

  const ruleId = parseInt(req.body.id);
  const ruleIndex = rules.findIndex((r) => r.id === ruleId);

  if (ruleIndex === -1) {
    return res.status(404).json({ error: "Rule not found" });
  }

  rules.splice(ruleIndex, 1);
  return res.status(200).json({ message: "Rule deleted successfully" });
}

// EXEC VE SPAWN FONKSİYONLARI
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

export async function uploadSqlFile(req, res) {
  if (!req.file) {
    console.log("====> Dosya Controller a Gelmedi");
    return res.status(400).json({ message: "Dosya yüklenmedi." });
  }

  try {
    console.log("===> Gelen Dosya: ", req.file);
    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    console.log("===> ext: ", ext);
    const fullPath = path.resolve(filePath);
    sqlFileFullPath = fullPath;
    console.log("===> FILE FULL PATH: ", fullPath);

    // YÜKLENEN DOSYANIN ÇALIŞTIRILMASI

    const fileType = getFileType(fullPath);
    console.log("===> File Type: ", fileType);

    // Servis üzerinden DB kayıtlarını getir
    const tb_servisTanimlari_data = await get_tb_servisTanimlari(
      fullPath,
      fileType
    );
    const tb_guvenlikKurallari_data = await get_tb_guvenlikKurallari(
      fullPath,
      fileType
    );
    const tb_protokoller_data = await get_tb_protokoller(fullPath, fileType);
    const tb_guvenlikKurallari_gruplari_data =
      await get_tb_guvenlikKurallari_gruplari(fullPath, fileType);
    const tb_servisTanimlari_uyeler_data = await get_tb_servisTanimlari_uyeler(
      fullPath,
      fileType
    );

    const tb_servis_atama_data = await get_tb_servis_atama(fullPath, fileType);

    // Gelen veriler üzerinden tüm bilgileri tek objede birleştirilmiş kayıt oluşturma
    createFullRule(rules, tb_servisTanimlari_uyeler_data, tb_protokoller_data,tb_servis_atama_data);

    return res.status(200).json({
      message: "Kayıtlar başarıyla alındı.",
      tb_guvenlikKurallari_data: tb_guvenlikKurallari_data,
      tb_servisTanimlari_data: tb_servisTanimlari_data,
      tb_protokoller_data: tb_protokoller_data,
      tb_servis_atama_data: tb_servis_atama_data,
      tb_servisTanimlari_uyeler_data: tb_servisTanimlari_uyeler_data,
      tb_guvenlikKurallari_gruplari_data: tb_guvenlikKurallari_gruplari_data,
    });
  } catch (err) {
    console.error("Controller hatası:", err);
    return res.status(500).json({ message: "Controller hatası: ", err });
  }
}

// ipv4 ve ipv6 ip'leri birbiri ile karşılaştırmak gerekir mi? - onlar ayrı , karşılaştırmaya gerek yok

//Analiz butonuna basılınca yapılacaklar
export function analysisConflicts(req, res) {
  console.log(
    "==== Rule verileri geldi, analize başlandı :",
    req.body.rules[0]
  );

  try {
    analysisRuleConflicts(req.body.rules);
    deleteSQLFile(sqlFileFullPath);
  } catch (err) {
    console.log("Analiz sırasında hata: ", err);
    deleteSQLFile(sqlFileFullPath);
    return;
  }
}

/* router.post("/upload-sql-file", upload.single("sqlfile"), async (req, res) => {
  // Komut seçimleri
  const isDump = ext === ".dump";
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
  }
}); */

function getFileType(filePath) {
  try {
    const output = execSync(`file "${filePath}"`).toString();
    if (output.includes("PostgreSQL custom database dump")) {
      return "custom";
    }
    return "plain";
  } catch (e) {
    return "unknown";
  }
}
