import { useState } from "react";
import "./App.css";

import CustomModal from "./components/RuleEditModal.jsx";
import Navbar from "./components/Navbar.jsx";
import CustomTable from "./components/CustomTable.jsx";
import AnalizButton from "./components/AnalizButton.jsx";
import GroupRulesButton from "./components/GroupRulesButton.jsx";
import RuleGroupModal from "./components/RuleGroupModal.jsx";

function App() {
  

  const [ruleEditModalOpen, setRuleEditModalOpen] = useState(false);
  const [ruleGroupEditModalOpen, setRuleGroupEditModalOpen] = useState(false);
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

  return (
    <>
      <div>
        {/* <Navbar /> */}
        <h5 className="text-2xl font-bold mb-4">Firewall Rule App</h5>

        <AnalizButton></AnalizButton>

        <div className="flex justify-end mb-4">
          <GroupRulesButton onClick={() => setRuleGroupEditModalOpen(true)} />
        </div>
        <RuleGroupModal
          isOpen={ruleGroupEditModalOpen}
          onClose={() => setRuleGroupEditModalOpen(false)}
        ></RuleGroupModal>

        <CustomModal
          isOpen={ruleEditModalOpen}
          onClose={handleCloseBtnClick}
          item={selectedItem}

         
        ></CustomModal>

        <div className="table-view">
          <CustomTable onEditClick={handleEditBtnClick} />
        </div>
      </div>
    </>
  );
}

export default App;
