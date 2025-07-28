import Joi, { func } from "joi";
import pool from "../DB/db.js";
import multer from "multer";
import fs from "fs";
import path from "path";


const rules = []; // veritabanından alınan rule listesi

export async function getRules(req, res) {
  // Tüm rule değerlerini gerekli bilgileri ile birlikte al

  // rules verilerini db den al

  try {
    // sorgular yazılırken her tablo ismi için çift tırnak kullanılmalı
    const result = await pool.query(
      'SELECT * FROM "public"."tb_guvenlikKurallari"'
    ); // tablonun adını değiştir

    console.log(result);

    res.json({ rules: result.rows });
  } catch (err) {
    console.error("Veri alınırken hata oluştu:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }

  return res.status(200).json({
    message: "Rules fetched successfully",
    rules: rules,
  });
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


export function uploadSqlFile(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "Dosya yüklenemedi." });
  }

  const filePath = path.join("uploads", req.file.filename);

  // Dosya içeriğini okuma (opsiyonel: direkt çalıştırma, kaydetme vs. için)
  const content = fs.readFileSync(filePath, "utf8");
  console.log("Yüklenen SQL dosyasının içeriği:\n", content);

  return res.status(200).json({ message: "Dosya başarıyla yüklendi!" });
}
