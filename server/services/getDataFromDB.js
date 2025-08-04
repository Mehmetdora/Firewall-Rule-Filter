import { exec } from "child_process";
import { json } from "stream/consumers";

export default async function tb_guvenlikKurallari(fullPath, fileType) {
  // yüklenen sql dosyasındaki tb_guvenlikKurallari tablosundaki kayıtları al

  /* 
    -U : kullanıcı adı , veritabanının
    -d : bağlanılacak veritabanı 
    -c : çalıştırılacak komut
    */

  let message = "Kayıtlar alınamadı...";
  let tb_guvenlikKurallari_data = null;

  let importCommand;
  if (fileType === "custom") {
    importCommand = `/opt/homebrew/opt/postgresql@16/bin/pg_restore -U postgres -d postgres -t public.tb_guvenlikKurallari "${fullPath}"`;
  } else {
    importCommand = `psql -U postgres -d postgres -f "${fullPath}"`;
  }

  exec(importCommand, (err1, stdout1, stderr1) => {
    console.log("===> 1. exec fonk. başladı...");
    if (err1) {
      console.error("===> Komut hatası(1. exec):", err1.message);
      return;
    }
    if (stderr1) {
      console.error("===> stderr error(1. exec):", stderr1);
      return;
    }
    console.log("===> 1. exec fonk. hatasız bitti...");

    // YÜKLENEN DOSYANIN İÇİNDEKİ KAYITLARIN ALINMASI
    const command = `psql -U postgres -d postgres -c "SELECT row_to_json(t) FROM (SELECT * FROM \\"public\\".\\"tb_guvenlikKurallari\\") t"`;
    exec(command, (err, stdout, stderr) => {
      console.log("===> 2. exec fonk. başladı...");

      if (err) {
        console.error("===> Komut hatası(2. exec):", err.message);
        return;
      }

      if (stderr) {
        console.error("===> stderr error(2. exec):", stderr);
        return;
      }

      console.log("===> 2. exec fonk. hatasız bitti, kayıtlar alınıyor...");

      // Çıktıyı satırlara ayır
      const lines = stdout.split("\n");

      // Gerçek JSON verisi içeren satırları filtrele
      const jsonObjects = lines
        .map((line) => line.trim())
        .filter((line) => line.startsWith("{") && line.endsWith("}"));

      // JSON objelerini parse et
      const jsonRules = jsonObjects
        .map((jsonStr) => {
          try {
            return JSON.parse(jsonStr);
          } catch (e) {
            console.warn("Geçersiz JSON:", jsonStr);
            return null;
          }
        })
        .filter((obj) => obj !== null);

      console.log("Parsed tb_guvenlikKurallari verisi: ", jsonRules[0]);

      message =
        "Kayıtlar başarıyla sql dosyası(tb_guvenlikKurallari) içerisinden alındı.";
      tb_guvenlikKurallari_data = jsonRules;
    });
  });

  return json({
    message: message,
    tb_guvenlikKurallari_data: tb_guvenlikKurallari_data,
  });
}

export function tb_servisTanımlari() {
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

    return {
      rules: result,
      headers: headers,
    };
  });
}
