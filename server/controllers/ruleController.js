import Joi from "joi";
import pool from "../DB/db.js";
import fs from "fs";
import path from "path";

import { exec } from "child_process";
import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const rules = []; // veritabanından alınan rule listesi

export async function getRules(req, res) {
  // Tüm rule değerlerini gerekli bilgileri ile birlikte al

  // rules verilerini db den al

  try {
    // sorgular yazılırken her tablo ismi için çift tırnak kullanılmalı
    const result = await pool.query(
      'SELECT * FROM "public"."tb_guvenlikKurallari"'
    ); // tablonun adını değiştir

    console.log("Rule verileri veritabanında alındı");
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
  console.log("uploadSqlFile ÇALIŞTI", req.file);

  if (!req.file) {
    console.log("[uploadSqlFile] Dosya bulunamadı!");
    return res.status(400).json({ message: "Dosya yüklenemedi." });
  }

  const filePath = path.join(process.cwd(), "uploads", req.file.filename);
  console.log(`[uploadSqlFile] Yüklenen dosya yolu: ${filePath}`);

  // SQL dosyasını okumak (isteğe bağlı)
  try {
    const content = fs.readFileSync(filePath, "utf8");
    console.log("[uploadSqlFile] SQL dosyası içeriği (ilk 500 karakter):");
    console.log(content.substring(0, 500)); // sadece baştan 500 karakter yazdır
  } catch (readErr) {
    console.error("[uploadSqlFile] Dosya okunurken hata:", readErr);
  }

  // psql komutunu exec ile çalıştır
  const command = `PGPASSWORD=${process.env.DB_PASSWORD} psql -h ${process.env.DB_HOST} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -f "${filePath}"`;

  console.log(`[uploadSqlFile] Çalıştırılan komut: ${command}`);

  exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
    console.log("[uploadSqlFile] exec callback tetiklendi.");

    if (error) {
      console.error("[uploadSqlFile] exec hata:", error);
      console.error("[uploadSqlFile] exec stderr:", stderr);
      return res.status(500).json({ error: error.message, details: stderr });
    }

    console.log("[uploadSqlFile] exec stdout:", stdout);
    console.log("[uploadSqlFile] exec stderr (varsa):", stderr);

    // SQL dosyası başarılı çalıştı, veritabanından veri çekelim
    const pool = new Pool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT),
      database: process.env.DB_NAME,
    });

    pool
      .query('SELECT * FROM "public"."tb_guvenlikKurallari" LIMIT 10')
      .then((result) => {
        console.log(
          "[uploadSqlFile] Veritabanından kayıtlar alındı:",
          result.rows.length
        );
        res.json({
          message: "SQL dosyası başarıyla çalıştırıldı ve veriler alındı.",
          rules: result.rows,
        });
      })
      .catch((dbErr) => {
        console.error("[uploadSqlFile] Veritabanı sorgu hatası:", dbErr);
        res.status(500).json({
          error: "Veritabanından veri alınamadı.",
          details: dbErr.message,
        });
      });
  });
}

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
