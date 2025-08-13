import { exec } from "child_process";
import { promisify } from "util";

// stdout/stderr buffer limitini 100 MB yapıldı , dosya büyük olduğu için
const execAsync = (command) =>
  promisify(exec)(command, { maxBuffer: 1024 * 1024 * 100 });

// sql dosyasının çalıştırılması için tek seferlik çalışan exec fonksiyonu
export async function runSqlFileOnce(fullPath, fileType) {
  const dbName = "test_db";
  let importCommand;

  if (fileType === "custom") {
    // pg_restore ana yolu ile gelen dosyayı çalıştırıyor 
    importCommand = `/opt/homebrew/opt/postgresql@16/bin/pg_restore -U postgres -d ${dbName} "${fullPath}"`;
  } else {
    // eğer dosya türü custom değiş ise psql ile yükleniyor(garanti olsun diye, bazıları pg_restore ile yüklenmiyor)
    importCommand = `psql -U postgres -d ${dbName} -f "${fullPath}"`;
  }

  try {
    console.log(`===> ${dbName} veritabanı sıfırlanıyor...`);

    // Bağlantıların kapatılması
    await execAsync(`
      psql -U postgres -c "SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = '${dbName}' AND pid <> pg_backend_pid();"
    `);

    // eğer bu isimde veritabanı varsa  siliniyor ki sonrasında üzerinde yazılmasın
    await execAsync(`psql -U postgres -c "DROP DATABASE IF EXISTS ${dbName};"`);

    await execAsync(`psql -U postgres -c "CREATE DATABASE ${dbName};"`);

    console.log(`===> ${dbName} oluşturuldu, import işlemi başlıyor...`);

    // SQL dosyasını yükle
    const { stdout, stderr } = await execAsync(importCommand);

    if (stderr && stderr.trim() !== "") {
      console.error("Import sırasında stderr çıktı:", stderr);
      // stderr her zaman hata değildir, ama burada loglamak iyi olur
    }

    console.log("===> SQL dosyası içeri aktarıldı.");
    return true;
  } catch (error) {
    console.error("----> Import işlemi başarısız:", error.message);
    return false;
  }
}

export default async function get_tb_guvenlikKurallari() {
  try {
    // tablodaki verileri çekmek için kullanılacak komut
    const command = `psql -U postgres -d test_db -c 'SELECT row_to_json(t) FROM (SELECT * FROM "public"."tb_guvenlikKurallari") t'`;

    console.log("===> tablodan veri çekiliyor...");
    const { stderr2, stdout } = await execAsync(command);
    if (stderr2) {
      console.log("----> tablodan veri çekme komut hatası: ", stderr2);
      return;
    }
    console.log("===> tablodan veri başarıyla çekildi.");

    if (stdout.length === 0) {
      return []; // veri yok
    }

    // stdout'u satırlara bölerek json haline getirme
    const lines = stdout.split("\n");

    // her satırı temizle ve tüm satırları birleştir ve ayır sonra json objesi haline getir
    const jsonObjects = lines
      .map((line) => line.trim())
      .filter((line) => line.startsWith("{") && line.endsWith("}"));

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

    console.log("Parse edilmiş tb_guvenlikKurallari verisi:", jsonRules[0]);

    return jsonRules;
  } catch (error) {
    console.error("tb_guvenlikKurallari verilerini getiren fonk. hatası:", error.message);
    throw error; // controllerdaki try-cache gider
  }
}

export async function get_tb_servisTanimlari() {
  /* 
    -U : kullanıcı adı , veritabanının
    -d : bağlanılacak veritabanı 
    -c : çalıştırılacak komut
    */

  try {
    // tablo kayıtlarını getir
    const command = `psql -U postgres -d test_db -c 'SELECT row_to_json(t) FROM (SELECT * FROM "public"."tb_servisTanimlari") t'`;

    console.log("===>  tablodan veri çekiliyor...");
    const { stderr2, stdout } = await execAsync(command);
    if (stderr2) {
      console.log("----> tabloda veri çekme komut hatası: ", stderr2);
      return;
    }
    console.log("===> tablodan veri çekme komutu tamamlandı.");

    if (stdout.length === 0) {
      return []; // veri yok
    }


    const lines = stdout.split("\n");
    const jsonObjects = lines
      .map((line) => line.trim())
      .filter((line) => line.startsWith("{") && line.endsWith("}"));

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

    console.log("Parse edilmiş tb_servisTanimlari verisi:", jsonRules[0]);

    return jsonRules;
  } catch (error) {
    console.error("tb_servisTanimlari verilerini getiren fonk. hatası:", error.message);
    throw error; 
  }
}

export async function get_tb_servisTanimlari_uyeler() {
  /* 
    -U : kullanıcı adı , veritabanının
    -d : bağlanılacak veritabanı 
    -c : çalıştırılacak komut
    */

  try {

    const command = `psql -U postgres -d test_db -c 'SELECT row_to_json(t) FROM (SELECT * FROM "public"."tb_servisTanimlari_uyeler") t'`;
    console.log("===> tablodan verileri çekecek komut çalıştırılıyor...");
    const { stderr2, stdout } = await execAsync(command);
    if (stderr2) {
      console.log("----> tablodan verileri çeken komut hatası: ", stderr2);
      return;
    }
    console.log("===> veri çekme komutu tamamlandı.");

    if (stdout.length === 0) {
      return []; // veri yok
    }

    const lines = stdout.split("\n");
    const jsonObjects = lines
      .map((line) => line.trim())
      .filter((line) => line.startsWith("{") && line.endsWith("}"));

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

    console.log("Parse edilmiş tb_servisTanimlari_uyeler verisi:", jsonRules[0]);

    return jsonRules;
  } catch (error) {
    console.error("tablodan tb_servisTanimlari_uyeler verilerini çeken fonk. hatası:", error.message);
    throw error; 
  }
}

export async function get_tb_guvenlikKurallari_gruplari() {
  /* 
    -U : kullanıcı adı , veritabanının
    -d : bağlanılacak veritabanı 
    -c : çalıştırılacak komut
    */

  try {
    const command = `psql -U postgres -d test_db -c 'SELECT row_to_json(t) FROM (SELECT * FROM "public"."tb_guvenlikKurallari_gruplari") t'`;
    console.log("===> tablodan verileri çeken komut çalıştırılıyor...");
    const { stderr2, stdout } = await execAsync(command);
    if (stderr2) {
      console.log("tablodan verileri çeken komut hatası: ", stderr2);
      return;
    }
    console.log("===> tablodan verileri çeken komut tamamlandı.");

    if (stdout.length === 0) {
      return []; // veri yok
    }


    const lines = stdout.split("\n");
    const jsonObjects = lines
      .map((line) => line.trim())
      .filter((line) => line.startsWith("{") && line.endsWith("}"));

    const jsonGroups = jsonObjects
      .map((jsonStr) => {
        try {
          return JSON.parse(jsonStr);
        } catch (e) {
          console.warn("Geçersiz JSON:", jsonStr);
          return null;
        }
      })
      .filter((obj) => obj !== null);

    console.log("Parse edilmiş  tb_guvenlikKurallari_gruplari verisi:", jsonGroups[0]);

    return jsonGroups;
  } catch (error) {
    console.error("----> tablodan tb_guvenlikKurallari_gruplari verilerini çeken fonk. hatası:", error.message);
    throw error; 
  }
}

export async function get_tb_servis_atama() {
  /* 
    -U : kullanıcı adı , veritabanının
    -d : bağlanılacak veritabanı 
    -c : çalıştırılacak komut
    */

  try {
    const command = `psql -U postgres -d test_db -c 'SELECT row_to_json(t) FROM (SELECT * FROM "public"."tb_servis_atama") t'`;
    console.log("===> tablodan verileri çeken komut çalıştırılıyor...");
    const { stderr2, stdout } = await execAsync(command);
    if (stderr2) {
      console.log("----> tablodan verileri çeken komut hatası: ", stderr2);
      return;
    }
    console.log("===> tablodan verileri çeken komut tamamlandı.");

    if (stdout.length === 0) {
      return []; // veri yok
    }

    // stdout'u satırlara böl
    const lines = stdout.split("\n");
    const jsonObjects = lines
      .map((line) => line.trim())
      .filter((line) => line.startsWith("{") && line.endsWith("}"));

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

    console.log("Parse edilmiş tb_servis_atama verisi:", jsonRules[0]);

    return jsonRules;
  } catch (error) {
    console.error("----> tablodan tb_servis_atama verilerini çeken fonk. hatası:", error.message);
    throw error; 
  }
}

// ilişkiler ve parçalı rule verilerini birleştirerek tam rule objesi oluşturur
export function createFullRule(
  servisTanimlari,
  guvenlikKurallari,
  guvenlikKurallari_gruplari,
  servisTanimlari_uyeler,
  servis_atama
) {
  let ruleList = [];

  guvenlikKurallari.forEach((guvenlikKurali) => {
    // servis_atama tablosundaki kural_id üzerinde servisleri al
    let fullRule = null;

    const eslesen_protokoller = servis_atama.filter(
      (item) => item.kural_id === guvenlikKurali.id
    );

    // güvenlikKural ile eşleşen servis_id 'lerini topla
    let servis_id_list = [];
    eslesen_protokoller.forEach((item) => {
      servis_id_list.push(item.servis_id);
    });

    // servis_id'leri üzerinden servis adını ve servisTanimlari_uyeler tablosundaki port bilgilerini topla

    let servisler = [];
    let servisTanim_uyeleri = [];
    servis_id_list.forEach((servis_id) => {
      const servis = servisTanimlari.find((item) => item.id == servis_id);
      const servisTanimlari_uye = servisTanimlari_uyeler.find(
        (item) => item.servis_id == servis_id
      );
      servisTanim_uyeleri.push(servisTanimlari_uye);
      servisler.push(servis);
    });

    // grup bilgisini ekle
    const group_sira_no = guvenlikKurallari_gruplari.find(
      (item) => item.id == guvenlikKurali.grup_id
    );


    fullRule = {
      id: guvenlikKurali.id,
      sira_no: guvenlikKurali.siraNo,
      grup_sira_no: group_sira_no.siraNo,
      aciklama: guvenlikKurali.aciklama,
      kaynakAdresleri: guvenlikKurali.kaynakAdres,
      hedefAdresleri: guvenlikKurali.hedefAdres,
      detaylar: guvenlikKurali.detaylar,
      servisler: servisler,
      servisTanim_uyeleri: servisTanim_uyeleri,
    };

    ruleList.push(fullRule);
  });

  return ruleList;
}
