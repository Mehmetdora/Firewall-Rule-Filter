import { useState } from "react";
import apiClient from "../api/api";
import axios from "axios";

export default function DatabaseUpload({ setRules, setHeaders }) {
  // Kullanıcı bir database dosyası (.sql) yüklemesi için kullanılacak komponent

  const [file, setFile] = useState();
  const [message, setMessage] = useState("");
  const [buttonName, setButtonName] = useState("Yükle");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith(".sql")) {
      setFile(file);
    } else {
      alert("Lütfen sadece .sql uzantılı dosya yükleyin.");
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Öncesinde bir .sql dosyası seçin.");
      return;
    }
    setButtonName("Dosya Yükleniyor, Kayıtlar Toplanıyor...");

    console.log(
      "---- Upload başlıyor...",
      file.name,
      `${Math.round(file.size / 1024 / 1024)}MB`
    );
    const startTime = Date.now();

    const formData = new FormData();
    formData.append("sqlfile", file);

    try {
      const response = await axios.post(
        "http://localhost:5050/rules/upload-sql-file",
        formData,

        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,

          timeout: 900000, // 15 dakika

          onUploadProgress: (progressEvent) => {
            const now = Date.now();
            let lastUpdate = 0;

            if (now - lastUpdate > 1000) {
              // 500ms'de bir güncelle
              lastUpdate = now;
              // güncelleme işlemleri
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              const elapsed = (Date.now() - startTime) / 1000;
              const speedMBps = progressEvent.loaded / 1024 / 1024 / elapsed;

              console.log(
                `---- Upload progress: ${progress}% - ${speedMBps.toFixed(
                  2
                )}MB/s`
              );
              setMessage(
                `Yükleniyor: ${progress}% (${speedMBps.toFixed(2)}MB/s)`
              );
            }
          },
        }
      );
      console.log("Gelen rule list: ", response.data.rules);

      const elapsed = (Date.now() - startTime) / 1000;
      console.log(`---- Upload tamamlandı: ${elapsed.toFixed(2)}s`);

      setMessage(response.data.message);
      setRules(response.data.rules);
      setButtonName("Yeni Dosya Yükle");
    } catch (error) {
      if (error.response) {
        // Sunucu yanıt verdi ama hata koduyla
        console.error("---- Sunucu hatası:", error.response.data);
        setMessage("Sunucu hatası: " + error.response.data.error);
      } else if (error.request) {
        // İstek yapıldı ama yanıt alınamadı
        console.error("---- Yanıt alınamadı:", error.request);
        setMessage("Yanıt alınamadı.");
      } else {
        // Başka bir hata
        console.error("---- İstek yapılamadı:", error.message);
        setMessage("İstek hatası: " + error.message);
      }
    }
  };

  return (
    <>
      <div className="p-4 border rounded-md shadow-md max-w-md mx-auto">
        <h4 className="text-m font-bold mb-4">
          Analiz Edilecek SQL Dosyasını Yükleyiniz
        </h4>
        <input
          className="bg-amber-100 rounded-xl text-red-400 font-bold p-4"
          type="file"
          accept=".sql"
          onChange={handleFileChange}
        />
        <button
          onClick={handleUpload}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {buttonName}
        </button>
        {message && <p className="mt-2 text-green-700">{message}</p>}
      </div>
    </>
  );
}
