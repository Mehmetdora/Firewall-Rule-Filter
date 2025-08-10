import { useState, useEffect } from "react";
import "./App.css";
import apiClient from "./api/api.js";
import axios from "axios";

import RuleEditModal from "./components/RuleEditModal.jsx";
import CustomTable from "./components/CustomTable.jsx";
import AnalizButton from "./components/AnalizButton.jsx";
import GroupRulesButton from "./components/GroupRulesButton.jsx";
import RuleGroupModal from "./components/RuleGroupModal.jsx";
import CreateRuleButton from "./components/CreateRuleButton.jsx";
import RuleCreateModal from "./components/RuleCreateModal.jsx";
import DatabaseUpload from "./components/DatabaseUpload.jsx";
import AnalizSonucModal from "./components/AnalizSonucModal.jsx";

function App() {
  const [ruleEditModalOpen, setRuleEditModalOpen] = useState(false);
  const [ruleGroupEditModalOpen, setRuleGroupEditModalOpen] = useState(false);
  const [createRuleModalOpen, setCreateRuleModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isFileUploaded, setIsFileUploaded] = useState(false);

  const [rules, setRules] = useState([]);
  const [headers, setHeaders] = useState([]);
  // Rule kayıtlarını yüklenecek olan sql dosyası içerisindeki kayıtlardan al

  // analiz için değerler
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [isAnalysisModalClose, setAnalysisModalClose] = useState(true);

  const handleEditBtnClick = (item) => {
    setSelectedItem(item);
    setRuleEditModalOpen(true);
    console.log("Clicked Edit Button Item:", item);
  };

  const handleCloseBtnClick = () => {
    setRuleEditModalOpen(false);
    setSelectedItem(null);
    console.log("Edit modall closed");
  };

  const handleCreateBtnClick = () => {
    setCreateRuleModalOpen(true);
    console.log("Create Modal opened");
  };

  useEffect(() => {
    //getRules();
  }, []);

  function getRules() {
    fetch("http://localhost:5050/rules", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Rule verileri alındı:", data.rules);
        setRules(data.rules);
      })
      .catch((error) => {
        console.error("Ruler verileri alınırken hata oluştu:", error);
      });
  }

  const handleDelete = (selectedItem) => {
    // axios ile istek atarken yapısı : axios.post(url, data, config); olmalı
    // eğer yeni bir axios ayarı yapılmışsa onu kullan.
    apiClient
      .post(
        "/rules/deleted",
        {
          id: selectedItem?.id,
        },

        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        // axios otomatik olarak json a parse eder
        setRules((prevRules) =>
          prevRules.filter((rule) => rule.id !== selectedItem.id)
        );
        console.log("Rule deleted successfully:");
      })
      .catch(async (error) => {
        const errorText = await error.text?.();
        console.error("Error: delete rule:", errorText || error);
        alert("Error deleting rule. Please try again.");
      });
  };

  const createRuleToServer = (newItem) => {
    console.log("Gelen yeni rule verileri: " + newItem);

    try {
      apiClient
        .post(
          "/rules/created",

          {
            id: newItem?.id,
            title: newItem.title,
            message: newItem.message,
            kaynak_guvenlikbolgesi: {
              value: newItem.kaynak_guvenlikbolgesi.value,
              isChecked: newItem.kaynak_guvenlikbolgesi.checked,
            },
            hedef_guvenlikbolgesi: {
              value: newItem.hedef_guvenlikbolgesi.value,
              isChecked: newItem.hedef_guvenlikbolgesi.checked,
            },
            kaynak_adresi: {
              value: newItem.kaynak_adresi.value,
              isChecked: newItem.kaynak_adresi.checked,
            },
            hedef_adresi: {
              value: newItem.hedef_adresi.value,
              isChecked: newItem.hedef_adresi.checked,
            },
            servisler: newItem.servisler,
          },

          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          console.log("Rule saved successfully:", response.data);
          rules.push(response.data.newItem);
        })
        .catch(async (error) => {
          console.log("axios için hataaaaa");

          if (error.response) {
            // Sunucudan gelen hatadır

            console.log("sunucuuuu");
            console.log(
              "Sunucu hatası:",
              error.response.data.errorMsg[0].message
            );
            alert("HATA: " + error.response.data.errorMsg[0].message); // örneğin: "email is required"
          } else if (error.request) {
            // İstek gönderildi ama cevap alınamadı
            console.log("cevap yooookk");
            console.log("Sunucu yanıt vermedi:", error.request);
          } else {
            // İstek hazırlanırken hata
            console.log("axioooooosssss");
            console.log("Axios hata:", error.message);
          }
        });
    } catch (error) {
      console.log("try-catch hatası");
      console.log("hata:" + error.response.data);
    }
  };

  const analysisRuleConflicts = async (rules) => {
    if (rules.length == 0) {
      alert(
        "Lütfen sql dosyasının yüklendiğinden ve ekranda verileri gördüğünüzden emin olduktan sonra tekrar deneyiniz!"
      );
    }

    console.log("====> Rule analizi başladı");
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      // axios ile gelen verilerden response.data ile erişmek için await kullanılmalı
      const response = await axios.post(
        "http://localhost:5050/rules/rules-conflict-analysis",
        {
          rules: rules,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setAnalysis(response.data.analysis);
      setAnalysisModalClose(false);
    } catch (error) {
      if (error.response) {
        // Sunucu yanıt verdi ama hata koduyla
        console.error("---- Sunucu hatası:", error.response.data);
        setError("Sunucu hatası: ", error.response.data);
      } else if (error.request) {
        // İstek yapıldı ama yanıt alınamadı
        console.error("---- Yanıt alınamadı:", error.request);
        setError("Yanıt anlınamadı: ", error.request);
      } else {
        // Başka bir hata
        console.error("---- İstek yapılamadı:", error.message);
        setError("İstek yapılamadı: ", error.message);
      }
    }
    setLoading(false);
  };

  return (
    <>
      <div>
        {/* <Navbar /> */}
        <div className="flex items-center mb-20 ">
          {/* Sol boşluk - flex sistemiyle daha iyi hizalanabilir */}
          {isFileUploaded ? <div className="flex-1"></div> : ""}
          {/* Orta başlık - artık tam genişlik gerekmiyor */}
          <div className="flex-auto text-center">
            <h5 className="text-3xl font-extrabold">
              Firewall Rule Conflict Analysis
            </h5>
          </div>
          {/* Sağ buton - artık margin/padding ile daha iyi kontrol */}

          {isFileUploaded ? (
            <div className="flex-1 flex justify-end pr-0">
              <AnalizButton
                analysis={analysis}
                rules = {rules}
                sendRules={analysisRuleConflicts}
                loading={loading}
              />
            </div>
          ) : (
            ""
          )}
        </div>
        <AnalizSonucModal
          isAnalysisModalClose={isAnalysisModalClose}
          analysis={analysis}
          setModalClose={setAnalysisModalClose}
        ></AnalizSonucModal>
        {/* 
            ŞİMDİLİK EKLEM DÜZENLEME GİBİ EK ÖZELLİKLER OLMADAN 
            SADECE ÇAKIŞMA ANALİZİ ÜZERİNDE DUR
        */}

        <DatabaseUpload
          setHeaders={setHeaders}
          setRules={setRules}
          setIsFileUploaded={setIsFileUploaded}
        ></DatabaseUpload>
        <div className="table-view">
          <CustomTable
            onEditClick={handleEditBtnClick}
            isFileUploaded={isFileUploaded}
            rules={rules}
          />
        </div>

        {/* <div className="flex justify-end mb-4">
          <GroupRulesButton onClick={() => setRuleGroupEditModalOpen(true)} />
        </div>

        <CreateRuleButton
          onClick={() => setCreateRuleModalOpen(true)}
        ></CreateRuleButton>
        <RuleCreateModal
          isOpen={createRuleModalOpen}
          onClose={() => setCreateRuleModalOpen(false)}
          createRuleToServer={createRuleToServer}
        ></RuleCreateModal>

        <RuleGroupModal
          isOpen={ruleGroupEditModalOpen}
          onClose={() => setRuleGroupEditModalOpen(false)}
        ></RuleGroupModal>

        <RuleEditModal
          isOpen={ruleEditModalOpen}
          onClose={handleCloseBtnClick}
          item={selectedItem}
          deleteItem={handleDelete}
        ></RuleEditModal> */}
      </div>
    </>
  );
}

export default App;
