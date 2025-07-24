import React from "react";

export default function RuleGroupModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="modal bg-black p-6 rounded-lg w-full max-w-md shadow-lg">
        <div className="head mb-4">
          <h1 className="text-xl font-bold">Group Rules</h1>
        </div>
        <div className="content space-y-2">
          <div>Rule 1</div>
          <div>Rule 2</div>
          <div>Rule 3</div>
          <div>Rule 4</div>
          <div>Rule 5</div>
          
        </div>
        <div className="footer flex justify-between mt-6">
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Close
          </button>
          <button className="bg-green-500 text-white px-4 py-2 rounded">
            Save
          </button>
         
        </div>
      </div>
    </div>
  );
}


