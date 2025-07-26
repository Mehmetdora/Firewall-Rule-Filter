import { useState, useEffect } from "react";
import "./App.css";

import RuleEditModal from "./components/RuleEditModal.jsx";
import CustomTable from "./components/CustomTable.jsx";
import AnalizButton from "./components/AnalizButton.jsx";
import GroupRulesButton from "./components/GroupRulesButton.jsx";
import RuleGroupModal from "./components/RuleGroupModal.jsx";
import CreateRuleButton from "./components/CreateRuleButton.jsx";
import RuleCreateModal from "./components/RuleCreateModal.jsx";

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
    fetch("http://localhost:5050/rules/deleted", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: selectedItem?.id,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setRules((prevRules) =>
          prevRules.filter((rule) => rule.id !== selectedItem.id)
        );

        console.log(data.message, data);
      })
      .catch(async (error) => {
        const errorText = await error.text?.();
        console.error("Error: delete rule:", errorText || error);
        alert("Error deleting rule. Please try again.");
      });

    // Here you would typically call an API to delete the item

    //buradan da item silinecek
  };

  return (
    <>
      <div>
        {/* <Navbar /> */}
        <h5 className="text-2xl font-bold mb-4">Firewall Rule App</h5>

        <AnalizButton></AnalizButton>

        <div className="flex justify-end mb-4">
          <CreateRuleButton
            onClick={() => setCreateRuleModalOpen(true)}
          ></CreateRuleButton>
          <GroupRulesButton onClick={() => setRuleGroupEditModalOpen(true)} />
        </div>

        <RuleCreateModal
          isOpen={createRuleModalOpen}
          onClose={() => setCreateRuleModalOpen(false)}
          
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
        ></RuleEditModal>

        <div className="table-view">
          <CustomTable onEditClick={handleEditBtnClick} rules={rules} />
        </div>
      </div>
    </>
  );
}

export default App;
