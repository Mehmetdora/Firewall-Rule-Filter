import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export default async function get_tb_guvenlikKurallari(fullPath, fileType) {
  let importCommand;

  if (fileType === "custom") {
    importCommand = `/opt/homebrew/opt/postgresql@16/bin/pg_restore -U postgres -d postgres -t public.tb_guvenlikKurallari "${fullPath}"`;
  } else {
    importCommand = `psql -U postgres -d postgres -f "${fullPath}"`;
  }

  try {
    console.log("===> 1. Komut çalıştırılıyor...");
    const { stderr1 } = await execAsync(importCommand);
    if (stderr1) {
      console.log("1. exec fonk. hatası: ", stderr1);
      return;
    }
    console.log("===> 1. Komut tamamlandı.");

    // SQL'den verileri al
    const command = `psql -U postgres -d postgres -c 'SELECT row_to_json(t) FROM (SELECT * FROM "public"."tb_guvenlikKurallari") t'`;
    console.log("===> 2. Komut çalıştırılıyor...");
    const { stderr2, stdout } = await execAsync(command);
    if (stderr2) {
      console.log("2. exec fonk. hatası: ", stderr2);
      return;
    }
    console.log("===> 2. Komut tamamlandı.");

    if (stdout.length === 0) {
      return []; // veri yok
    }

    // stdout'u satırlara böl
    const lines = stdout.split("\n");

    // JSON satırlarını filtrele
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

    console.log("Parsed tb_guvenlikKurallari verisi:", jsonRules[0]);

    return jsonRules;
  } catch (error) {
    console.error("getDataFromDB servis hatası:", error.message);
    throw error; // controller'daki try/catch'e gider
  }
}

export async function get_tb_servisTanimlari(fullPath, fileType) {
  /* 
    -U : kullanıcı adı , veritabanının
    -d : bağlanılacak veritabanı 
    -c : çalıştırılacak komut
    */

  let importCommand;

  if (fileType === "custom") {
    importCommand = `/opt/homebrew/opt/postgresql@16/bin/pg_restore -U postgres -d postgres -t public.tb_servisTanimlari "${fullPath}"`;
  } else {
    importCommand = `psql -U postgres -d postgres -f "${fullPath}"`;
  }

  try {
    console.log("===> 1. Komut çalıştırılıyor...");
    const { stderr1 } = await execAsync(importCommand);
    if (stderr1) {
      console.log("1. exec fonk. hatası: ", stderr1);
      return;
    }
    console.log("===> 1. Komut tamamlandı.");

    // SQL'den verileri al
    const command = `psql -U postgres -d postgres -c 'SELECT row_to_json(t) FROM (SELECT * FROM "public"."tb_servisTanimlari") t'`;
    console.log("===> 2. Komut çalıştırılıyor...");
    const { stderr2, stdout } = await execAsync(command);
    if (stderr2) {
      console.log("2. exec fonk. hatası: ", stderr2);
      return;
    }
    console.log("===> 2. Komut tamamlandı.");

    if (stdout.length === 0) {
      return []; // veri yok
    }

    // stdout'u satırlara böl
    const lines = stdout.split("\n");

    // JSON satırlarını filtrele
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

    console.log("Parsed tb_servisTanimlari verisi:", jsonRules[0]);

    return jsonRules;
  } catch (error) {
    console.error("getDataFromDB servis hatası:", error.message);
    throw error; // controller'daki try/catch'e gider
  }
}

export async function get_tb_servisTanimlari_uyeler(fullPath, fileType) {
  /* 
    -U : kullanıcı adı , veritabanının
    -d : bağlanılacak veritabanı 
    -c : çalıştırılacak komut
    */

  let importCommand;

  if (fileType === "custom") {
    importCommand = `/opt/homebrew/opt/postgresql@16/bin/pg_restore -U postgres -d postgres -t public.tb_servisTanimlari_uyeler "${fullPath}"`;
  } else {
    importCommand = `psql -U postgres -d postgres -f "${fullPath}"`;
  }

  try {
    console.log("===> 1. Komut çalıştırılıyor...");
    const { stderr1 } = await execAsync(importCommand);
    if (stderr1) {
      console.log("1. exec fonk. hatası: ", stderr1);
      return;
    }
    console.log("===> 1. Komut tamamlandı.");

    // SQL'den verileri al
    const command = `psql -U postgres -d postgres -c 'SELECT row_to_json(t) FROM (SELECT * FROM "public"."tb_servisTanimlari_uyeler") t'`;
    console.log("===> 2. Komut çalıştırılıyor...");
    const { stderr2, stdout } = await execAsync(command);
    if (stderr2) {
      console.log("2. exec fonk. hatası: ", stderr2);
      return;
    }
    console.log("===> 2. Komut tamamlandı.");

    if (stdout.length === 0) {
      return []; // veri yok
    }

    // stdout'u satırlara böl
    const lines = stdout.split("\n");

    // JSON satırlarını filtrele
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

    console.log("Parsed tb_servisTanimlari_uyeler verisi:", jsonRules[0]);

    return jsonRules;
  } catch (error) {
    console.error("getDataFromDB servis hatası:", error.message);
    throw error; // controller'daki try/catch'e gider
  }
}

export async function get_tb_guvenlikKurallari_gruplari(fullPath, fileType) {
  /* 
    -U : kullanıcı adı , veritabanının
    -d : bağlanılacak veritabanı 
    -c : çalıştırılacak komut
    */

  let importCommand;

  if (fileType === "custom") {
    importCommand = `/opt/homebrew/opt/postgresql@16/bin/pg_restore -U postgres -d postgres -t public.tb_guvenlikKurallari_gruplari "${fullPath}"`;
  } else {
    importCommand = `psql -U postgres -d postgres -f "${fullPath}"`;
  }

  try {
    console.log("===> 1. Komut çalıştırılıyor...");
    const { stderr1 } = await execAsync(importCommand);
    if (stderr1) {
      console.log("1. exec fonk. hatası: ", stderr1);
      return;
    }
    console.log("===> 1. Komut tamamlandı.");

    // SQL'den verileri al
    const command = `psql -U postgres -d postgres -c 'SELECT row_to_json(t) FROM (SELECT * FROM "public"."tb_guvenlikKurallari_gruplari") t'`;
    console.log("===> 2. Komut çalıştırılıyor...");
    const { stderr2, stdout } = await execAsync(command);
    if (stderr2) {
      console.log("2. exec fonk. hatası: ", stderr2);
      return;
    }
    console.log("===> 2. Komut tamamlandı.");

    if (stdout.length === 0) {
      return []; // veri yok
    }

    // stdout'u satırlara böl
    const lines = stdout.split("\n");

    // JSON satırlarını filtrele
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

    console.log("Parsed tb_guvenlikKurallari_gruplari verisi:", jsonRules[0]);

    return jsonRules;
  } catch (error) {
    console.error("getDataFromDB servis hatası:", error.message);
    throw error; // controller'daki try/catch'e gider
  }
}

export async function get_tb_protokoller(fullPath, fileType) {
  /* 
    -U : kullanıcı adı , veritabanının
    -d : bağlanılacak veritabanı 
    -c : çalıştırılacak komut
    */

  let importCommand;

  if (fileType === "custom") {
    importCommand = `/opt/homebrew/opt/postgresql@16/bin/pg_restore -U postgres -d postgres -t public.tb_servisTanimlari "${fullPath}"`;
  } else {
    importCommand = `psql -U postgres -d postgres -f "${fullPath}"`;
  }

  try {
    console.log("===> 1. Komut çalıştırılıyor...");
    const { stderr1 } = await execAsync(importCommand);
    if (stderr1) {
      console.log("1. exec fonk. hatası: ", stderr1);
      return;
    }
    console.log("===> 1. Komut tamamlandı.");

    // SQL'den verileri al
    const command = `psql -U postgres -d postgres -c 'SELECT row_to_json(t) FROM (SELECT * FROM "public"."tb_servisTanimlari") t'`;
    console.log("===> 2. Komut çalıştırılıyor...");
    const { stderr2, stdout } = await execAsync(command);
    if (stderr2) {
      console.log("2. exec fonk. hatası: ", stderr2);
      return;
    }
    console.log("===> 2. Komut tamamlandı.");

    if (stdout.length === 0) {
      return []; // veri yok
    }

    // stdout'u satırlara böl
    const lines = stdout.split("\n");

    // JSON satırlarını filtrele
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

    console.log("Parsed tb_servisTanimlari verisi:", jsonRules[0]);

    return jsonRules;
  } catch (error) {
    console.error("getDataFromDB servis hatası:", error.message);
    throw error; // controller'daki try/catch'e gider
  }
}

export async function get_tb_servis_atama(fullPath, fileType) {
  /* 
    -U : kullanıcı adı , veritabanının
    -d : bağlanılacak veritabanı 
    -c : çalıştırılacak komut
    */

  let importCommand;

  if (fileType === "custom") {
    importCommand = `/opt/homebrew/opt/postgresql@16/bin/pg_restore -U postgres -d postgres -t public.tb_servis_atama "${fullPath}"`;
  } else {
    importCommand = `psql -U postgres -d postgres -f "${fullPath}"`;
  }

  try {
    console.log("===> 1. Komut çalıştırılıyor...");
    const { stderr1 } = await execAsync(importCommand);
    if (stderr1) {
      console.log("1. exec fonk. hatası: ", stderr1);
      return;
    }
    console.log("===> 1. Komut tamamlandı.");

    // SQL'den verileri al
    const command = `psql -U postgres -d postgres -c 'SELECT row_to_json(t) FROM (SELECT * FROM "public"."tb_servis_atama") t'`;
    console.log("===> 2. Komut çalıştırılıyor...");
    const { stderr2, stdout } = await execAsync(command);
    if (stderr2) {
      console.log("2. exec fonk. hatası: ", stderr2);
      return;
    }
    console.log("===> 2. Komut tamamlandı.");

    if (stdout.length === 0) {
      return []; // veri yok
    }

    // stdout'u satırlara böl
    const lines = stdout.split("\n");

    // JSON satırlarını filtrele
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

    console.log("Parsed tb_servis_atama verisi:", jsonRules[0]);

    return jsonRules;
  } catch (error) {
    console.error("getDataFromDB servis hatası:", error.message);
    throw error; // controller'daki try/catch'e gider
  }
}

// ilişkiler ve parçalı rule verilerini birleştirerek tam rule objesi oluşturur
export function createFullRule(rules, servisTanim_uyeler, protokoller,servis_atamalar) {
  let protokol_id_list = [];
  protokoller.forEach((protokol) => {
    const protokol_id = { protokol: protokol.adi, id: protokol.id };
    protokol_id_list.push(protokol_id);
  });

  const fullRule = null;

  const rule_with_port_protokol_list = [];

  let guvenlikKurallari_part = null;
  let protokol_part = null;
  let port_part = null;

  servisTanim_uyeler.forEach((servis_tanimi) => {
    const eslesenProtokol = protokol_id_list.find(
      (item) => item.id === servis_tanimi.servis_id
    );

    const protokol = eslesenProtokol.protokol;
    const kaynakPortBaslangic = servis_tanimi.kaynakPortBaslangic;
    const hedefPortBaslangic = servis_tanimi.hedefPortBaslangic;
    const kaynakPortBitis = servis_tanimi.kaynakPortBitis;
    const hedefPortBitis = servis_tanimi.hedefPortBitis;

    const rule_with_port_protokol = {
      protokol: protokol,
      kaynakPortBaslangic: kaynakPortBaslangic,
      kaynakPortBitis: kaynakPortBitis,
      hedefPortBaslangic: hedefPortBaslangic,
      hedefPortBitis: hedefPortBitis,
    };
    rule_with_port_protokol_list.push(rule_with_port_protokol);
  });



  console.log("=====> Rule listesi : ",rule_with_port_protokol_list);
  
}
