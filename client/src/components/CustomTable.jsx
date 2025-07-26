import { useState } from "react";
import EditButton from "./EditButton";

//ruler verilerini sunucudan al

export default function CustomTable({ onEditClick ,rules}) {
  
  

  

  return (
    <div className="p-6 w-300 mx-auto space-y-1">
      {rules.map((item) => (
        <div
          key={item.id}
          className="bg-gray-50 hover:bg-gray-100 border rounded-lg shadow-sm p-4 flex justify-between items-start"
        >
          <div className="ml-0 text-black font-bold id-numbers  bg-yellow ">
            <h3>{item.id}</h3>
          </div>

          {/* Sol taraf: Bildirim içeriği */}
          <div className="flex items-start w-full">
            <h2 className="text-md ml-4 font-semibold text-gray-800 uppercase tracking-wide">
              {item.title}
            </h2>
            <div className="ml-4 flex-1">
              <p className="text-gray-600 text-sm mt-1">{item.message}</p>
              <span className="text-gray-400 text-xs">{item.time}</span>
            </div>
          </div>

          {/* Sağ taraf: Edit butonu */}

          <EditButton onClick={() => onEditClick(item)}></EditButton>
          {/* <button
            onClick={handleEdit(item.id)}
            className="ml-4 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
          >
            Edit
          </button> */}
        </div>
      ))}
    </div>
  );
}
