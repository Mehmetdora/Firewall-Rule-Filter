import { useState } from "react";

export default function DatabaseUpload() {
  // Kullanıcı bir database dosyası (.sql) yüklemesi için kullanılacak komponent

  const [file, setFile] = useState();
  const [message, setMessage] = useState("");

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
      alert("Önce bir .sql dosyası seçin.");
      return;
    }

    const formData = new FormData();
    formData.append("sqlFile", file);
    try {
      const response = await axios.post(
        "http://localhost:5050/rules/upload-sql-file",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(response.data.message);
    } catch (error) {
      console.error("Yükleme hatası:", error);
      setMessage("Dosya yüklenemedi.");
    }
  };

  return (
    <>
      <div className="p-4 border rounded-md shadow-md max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-2">SQL Dosyası Yükle</h2>
        <input type="file" accept=".sql" onChange={handleFileChange} />
        <button
          onClick={handleUpload}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Yükle
        </button>
        {message && (
          <p className="mt-2 text-green-700">{message}</p>
        )}
      </div>
    </>
  );
}
