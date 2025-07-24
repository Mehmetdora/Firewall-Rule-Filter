import { useState } from "react";
import EditButton from "./EditButton";

const rules = [
    {
      id: 1,
      title: "Firewall Rule 1",
      message: "Rule 1 ",
      time: "3 weeks ago",
      kaynak_guvenlikbolgesi: {value: "LAN",isChecked: true},
      hedef_guvenlikbolgesi: {value: "LAN",isChecked: true},
      kaynak_adresi: {value: "122.22.2.2",isChecked: true},
      hedef_adresi: {value: "122.22.2.2",isChecked: true},
      servisler: "HTTPS",
    },
    {
      id: 2,
      title: "Firewall Rule 2",
      message: "Rule 2",
      time: "3 weeks ago",
      kaynak_guvenlikbolgesi: {value: "LAN",isChecked: true},
      hedef_guvenlikbolgesi: {value: "LAN",isChecked: true},
      kaynak_adresi: {value: "122.22.2.2",isChecked: true},
      hedef_adresi: {value: "333.22.21.2",isChecked: true},
      servisler: "HTTP",
    },
  ];

export default function CustomTable({ onEditClick }) {
  
  

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
          <div>
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
              {item.title}
            </h2>
            <p className="text-gray-600 text-sm mt-1">{item.message}</p>
            <span className="text-gray-400 text-xs">{item.time}</span>
          </div>

          {/* Sağ taraf: Edit butonu */}

          <EditButton onClick={() => onEditClick(item)} ></EditButton>
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
