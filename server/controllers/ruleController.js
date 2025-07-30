import Joi from "joi";
import pool from "../DB/db.js";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { Pool } from "pg";

import dotenv from "dotenv";
dotenv.config();

const rules = []; // veritabanından alınan rule listesi

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

/* async function runSqlFile(filePath) {
  return new Promise((resolve, reject) => {
    exec(
      `PGPASSWORD=${process.env.DB_PASSWORD} psql -h ${process.env.DB_HOST} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -f ${filePath}`,
      (error, stdout, stderr) => {
        console.log("exec callback tetiklendi");
        if (error) {
          console.error("psql error:", error);
          return res.status(500).json({ error: error.message });
        }
        console.log("psql stdout:", stdout);
        console.log("psql stderr:", stderr);
        res.json({ message: "SQL dosyası başarıyla çalıştırıldı" });
      }
    );
  });
} */

export async function uploadSqlFile(req, res) {
  console.log("=== uploadSqlFile ÇALIŞTI ===", {
    originalname: req.file?.originalname,
    size: req.file?.size,
  });

  if (!req.file) {
    console.log("[uploadSqlFile] Dosya bulunamadı!");
    return res.status(400).json({ message: "Dosya yüklenemedi." });
  }

  const filePath = req.file.path; // Eksik olan filePath tanımı

  try {
    if (
      req.file.originalname.includes("dump") ||
      req.file.mimetype === "application/octet-stream"
    ) {
      // Binary dump dosyası için pg_restore
      const pgRestorePath = "/opt/homebrew/opt/postgresql@15/bin/pg_restore";
      const args = [
        "-h",
        process.env.DB_HOST,
        "-U",
        process.env.DB_USER,
        "-d",
        process.env.DB_NAME,
        "-v",
        filePath,
      ];

      const child = spawn(pgRestorePath, args, {
        env: {
          ...process.env,
          PGPASSWORD: process.env.DB_PASSWORD || "",
        },
        maxBuffer: 1024 * 1024 * 50, // 50MB
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      const exitCode = await new Promise((resolve) => {
        child.on("close", resolve);
      });

      console.log("[uploadSqlFile] pg_restore çıktı kodu:", exitCode);

      try {
        fs.unlinkSync(filePath);
        console.log("[uploadSqlFile] Geçici dosya silindi");
      } catch (unlinkErr) {
        console.error("[uploadSqlFile] Dosya silinemedi:", unlinkErr);
      }

      if (exitCode !== 0) {
        console.error("[uploadSqlFile] pg_restore başarısız:", stderr);
        return res.status(500).json({
          error: "pg_restore işlemi başarısız",
          details: stderr,
        });
      }
    } else {
      // Normal SQL dosyası için psql veya doğrudan işleme
      const sqlContent = fs.readFileSync(filePath, "utf8");
      const pool = new Pool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME,
      });

      await pool.query(sqlContent);
      fs.unlinkSync(filePath);
    }

    // Her iki durumda da verileri çek
    const pool = new Pool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME,
    });

    const result = await pool.query(
      'SELECT * FROM "public"."tb_guvenlikKurallari" LIMIT 10'
    );
    await pool.end();

    res.json({
      message: "SQL dosyası başarıyla çalıştırıldı ve veriler alındı.",
      rules: result.rows,
      rowCount: result.rows.length,
    });
  } catch (error) {
    console.error("[uploadSqlFile] Genel hata:", error);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (unlinkErr) {
      console.error("[uploadSqlFile] Dosya silinemedi:", unlinkErr);
    }

    res.status(500).json({
      error: "İşlem sırasında hata oluştu",
      details: error.message,
    });
  }
}

/*
 */

/* export async function uploadSqlFile(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "Dosya yüklenemedi." });
  }

  const filePath = path.join("uploads", req.file.filename);

  // Dosya içeriğini okuma (opsiyonel: direkt çalıştırma, kaydetme vs. için)
  const content = fs.readFileSync(filePath, "utf8");

  // Bu şekilde yeni  bir pool objesi oluşturulmalı
  const customPool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
  });

  try {
    const output = await runSqlFile(filePath);
    console.log("SQL dosyası çalıştırıldı:", output);

    const result = await customPool.query(
      'SELECT * FROM "public"."tb_guvenlikKurallari"'
    );
    res.json({
      message: "Dosya yüklendi ve tablolar oluşturuldu",
      rules: result.rows,
    });
  } catch (error) {
    console.error("Hata:", error);
    res.status(500).json({ error: error.toString() });
  }

  /* try {
    

    // SQL dosyasındaki tüm komutları çalıştır
    console.log("Çalıştırılacak SQL içeriği:", content);
    await customPool.query(content);
    console.log("SQL dosyası çalıştırıldı.");

    // Artık tablo varsa veriyi alabilirsin
    const result = await customPool.query(
      'SELECT * FROM "public"."tb_guvenlikKurallari"'
    );

    res.json({
      message: "SQL dosyası başarıyla çalıştırıldı",
      rules: result.rows,
    });
  } catch (err) {
    console.error("SQL dosyası çalıştırılırken hata oluştu:", err);
    res.status(500).json({ error: "SQL dosyası çalıştırılamadı" });
  } 
} */
