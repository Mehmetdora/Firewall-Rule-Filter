import Joi from "joi";
import pool from "../DB/db.js";
import path from "path";
import { exec } from "child_process";
import {
  analysisRuleConflicts,
  deleteSQLFile,
} from "../services/conflictAnalyser.js";

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

export function uploadSqlFile(req, res) {
  if (!req.file) {
    console.log("====> Dosya Controller a Gelmedi");
    return res.status(400).json({ message: "Dosya yüklenmedi." });
  }

  console.log("===> Gelen Dosya: ", req.file);
  const filePath = req.file.path;
  const ext = path.extname(req.file.originalname).toLowerCase();
  console.log("===> ext: ", ext);
  const fullPath = path.resolve(filePath);
  sqlFileFullPath = fullPath;
  console.log("===> FILE FULL PATH: ", fullPath);

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

    // Çıktıyı satırlara ayır
    const lines = stdout.split("\n").filter((line) => line.trim() !== "");

    if (lines.length < 2) {
      console.log("No data found");
      return;
    }

    // Sütun isimlerini al (ilk satır)
    const headers = lines[0].split("|").map((h) => h.trim());

    // Veri satırlarını işle, ilk satır tablo başlıkları, 2. satır boş ifadeler,3 den başla
    // son satır boş ifadeler içeriyor , alma
    let i = 2;
    const result = [];
    for (i; i < lines.length - 1; i++) {
      const values = lines[i].split("|").map((v) => v.trim());
      const row = {};

      for (let j = 0; j < headers.length; j++) {
        if (j >= values.length) {
          row[headers[j]] = null;
          continue;
        }

        let value = values[j];

        // Boş değerleri null yap
        if (value === "") {
          value = null;
        }
        // JSON formatındaki string'leri parse et
        else if (value.startsWith("{") || value.startsWith("[")) {
          try {
            value = JSON.parse(value);
          } catch (e) {
            // JSON parse edilemezse olduğu gibi bırak
          }
        }
        // 't' ve 'f' değerlerini boolean'a çevir
        else if (value === "t") {
          value = true;
        } else if (value === "f") {
          value = false;
        }

        row[headers[j]] = value;
      }

      result.push(row);
    }

    //console.log(result);

    return res.status(200).json({
      message: "Dosya yüklendi ,dosya içindeki kayıtlar alındı.",
      rules: result,
      headers: headers,
    });
  });
}

export function ekOzellikliUploadSqlFile(req, res) {
  if (!req.file) {
    console.log("====> Dosya Controller'a Gelmedi");
    return res.status(400).json({ message: "Dosya yüklenmedi." });
  }

  const filePath = req.file.path;
  const ext = path.extname(req.file.originalname).toLowerCase();

  if (ext !== ".sql") {
    return res
      .status(400)
      .json({ message: "Yalnızca .sql uzantılı dosyalar destekleniyor." });
  }

  const fullPath = path.resolve(filePath);
  const tempDbName = `temp_db_${Date.now()}`;
  const tableName = "tb_guvenlikKurallari";

  // 1. Geçici veritabanı oluştur
  exec(`createdb -U postgres ${tempDbName}`, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ [createdb] exec error:", err.message);
    }
    if (stderr) {
      console.error("⚠️ [createdb] stderr:", stderr);
    }
    if (err || stderr) {
      return res
        .status(500)
        .json({ message: "Geçici veritabanı oluşturulamadı." });
    }

    console.log("✅ Geçici veritabanı oluşturuldu:", tempDbName);

    // 2. Dump dosyasını yükle
    exec(
      `psql -U postgres -d ${tempDbName} -f "${fullPath}"`,
      (err, stdout, stderr) => {
        if (err) {
          console.error("❌ [psql -f] exec error:", err.message);
        }
        if (stderr) {
          console.error("⚠️ [psql -f] stderr:", stderr);
        }
        if (err || stderr) {
          // Temizleme
          exec(`dropdb -U postgres ${tempDbName}`, () => {});
          return res
            .status(500)
            .json({ message: "Dump dosyası geçici veritabanına yüklenemedi." });
        }

        console.log("✅ Dump dosyası başarıyla yüklendi.");

        // 3. Tablo verilerini al
        const query = `psql -U postgres -d ${tempDbName} -c "SELECT * FROM \\"public\\".\\"${tableName}\\""`;

        exec(query, (err, stdout, stderr) => {
          // Her durumda temizleme
          exec(
            `dropdb -U postgres ${tempDbName}`,
            (dropErr, dropOut, dropStderr) => {
              if (dropErr) {
                console.error("❌ [dropdb] exec error:", dropErr.message);
              }
              if (dropStderr) {
                console.error("⚠️ [dropdb] stderr:", dropStderr);
              }
              console.log("🧹 Geçici veritabanı silindi:", tempDbName);
            }
          );

          if (err) {
            console.error("❌ [SELECT] exec error:", err.message);
          }
          if (stderr) {
            console.error("⚠️ [SELECT] stderr:", stderr);
          }
          if (err || stderr) {
            return res
              .status(500)
              .json({ message: `Tablodan veri okunamadı: ${tableName}` });
          }

          const lines = stdout.split("\n").filter((line) => line.trim() !== "");
          if (lines.length < 2) {
            return res.status(200).json({
              message: "Tablo bulundu ancak kayıt yok.",
              rules: [],
              headers: [],
            });
          }

          const headers = lines[0].split("|").map((h) => h.trim());
          const result = [];

          for (let i = 2; i < lines.length - 1; i++) {
            const values = lines[i].split("|").map((v) => v.trim());
            const row = {};

            for (let j = 0; j < headers.length; j++) {
              if (j >= values.length) {
                row[headers[j]] = null;
                continue;
              }

              let value = values[j];

              if (value === "") {
                value = null;
              } else if (value === "t") {
                value = true;
              } else if (value === "f") {
                value = false;
              } else if (value.startsWith("{") || value.startsWith("[")) {
                try {
                  value = JSON.parse(value);
                } catch (_) {}
              }

              row[headers[j]] = value;
            }

            result.push(row);
          }

          return res.status(200).json({
            message: "Veriler başarıyla alındı.",
            rules: result,
            headers: headers,
          });
        });
      }
    );
  });
}


// ipv4 ve ipv6 ip'leri birbiri ile karşılaştırmak gerekir mi?

//Analiz butonuna basılınca yapılacaklar
export function analysisConflicts(req, res) {
  console.log("Rule verileri geldi: ", req.body.rules);
  analysisRuleConflicts(req.body.rules);
  deleteSQLFile(sqlFileFullPath);
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
