import { useState, useEffect } from "react";
import "./App.css";
import apiClient from "./api/api.js";

import RuleEditModal from "./components/RuleEditModal.jsx";
import CustomTable from "./components/CustomTable.jsx";
import AnalizButton from "./components/AnalizButton.jsx";
import GroupRulesButton from "./components/GroupRulesButton.jsx";
import RuleGroupModal from "./components/RuleGroupModal.jsx";
import CreateRuleButton from "./components/CreateRuleButton.jsx";
import RuleCreateModal from "./components/RuleCreateModal.jsx";
import DatabaseUpload from "./components/DatabaseUpload.jsx";

function App() {
  const [ruleEditModalOpen, setRuleEditModalOpen] = useState(false);
  const [ruleGroupEditModalOpen, setRuleGroupEditModalOpen] = useState(false);
  const [createRuleModalOpen, setCreateRuleModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

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
    getRules();
  }, []);

  const [rules, setRules] = useState([]);

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

  return (
    <>
      <div>
        {/* <Navbar /> */}
        <h5 className="text-2xl font-bold mb-4">
          Firewall Rule Conflict Analysis
        </h5>
        <div className="mr-0 pr-0 text-end">
          <AnalizButton></AnalizButton>
        </div>
        {/* 
            ŞİMDİLİK EKLEM DÜZENLEME GİBİ EK ÖZELLİKLER OLMADAN 
            SADECE ÇAKIŞMA ANALİZİ ÜZERİNDE DUR
        */}
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

        <DatabaseUpload></DatabaseUpload>
        {/* <div className="table-view">
          <CustomTable onEditClick={handleEditBtnClick} rules={rules} />
        </div> */}
      </div>
    </>
  );
}

export default App;
