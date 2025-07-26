import { Description } from "@headlessui/react";
import React from "react";
import { useState } from "react";

export function RuleCreateModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  var item = {
    title: "",
    message: "",
    kaynak_guvenlikbolgesi: { value: "", isChecked: false },
    hedef_guvenlikbolgesi: { value: "", isChecked: false },
    kaynak_adresi: { value: "", isChecked: false },
    hedef_adresi: { value: "", isChecked: false },
    servisler: "",
  };

  var [title, setTitle] = useState("");
  var [description, setDescription] = useState("");
  var [kaynak_guvenlikbolgesi, setKaynakGuvenlikBolgesi] = useState("");
  var [hedef_guvenlikbolgesi, setHedefGuvenlikBolgesi] = useState("");
  var [kaynak_adresi, setKaynakAdresi] = useState("");
  var [hedef_adresi, setHedefAdresi] = useState("");
  const [servisler, setServisler] = useState("");

  function saveRule() {
    if (
      !title ||
      !description ||
      !kaynak_guvenlikbolgesi ||
      !hedef_guvenlikbolgesi ||
      !kaynak_adresi ||
      !hedef_adresi
    ) {
      alert("Please fill in all fields.");
      return;
    }

    item.title = title;
    item.message = description;
    item.kaynak_guvenlikbolgesi = {
      value: kaynak_guvenlikbolgesi,
      isChecked: checked.kaynakBolge,
    };
    item.hedef_guvenlikbolgesi = {
      value: hedef_guvenlikbolgesi,
      isChecked: checked.hedefBolge,
    };
    item.kaynak_adresi = {
      value: kaynak_adresi,
      isChecked: checked.kaynakAdres,
    };
    item.hedef_adresi = { value: hedef_adresi, isChecked: checked.hedefAdres };
    item.servisler = servisler;

    console.log("Created item:", item);

    createRuleToServer();

    onClose();
  }

  // Kaydedilen verilerin server a gönderilmesi

  function createRuleToServer() {
    console.log("istek atıldı");

    fetch("http://localhost:5050/rules/created", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: item?.id,
        title,
        message: description,
        time: new Date().toISOString(),
        kaynak_guvenlikbolgesi: {
          value: kaynak_guvenlikbolgesi,
          isChecked: checked.kaynakBolge,
        },
        hedef_guvenlikbolgesi: {
          value: hedef_guvenlikbolgesi,
          isChecked: checked.hedefBolge,
        },
        kaynak_adresi: {
          value: kaynak_adresi,
          isChecked: checked.kaynakAdres,
        },
        hedef_adresi: {
          value: hedef_adresi,
          isChecked: checked.hedefAdres,
        },
        servisler,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Rule saved successfully:", data);
      })
      .catch(async (error) => {
        const errorText = await error.text?.();
        console.error("Error saving rule:", errorText || error);
        console.error("Error details:", error);
        console.error("Error saving rule:", error);
        alert("Error saving rule. Please try again.");
      });
  }

  const [checked, setChecked] = useState({
    kaynakBolge: item?.kaynak_guvenlikbolgesi.isChecked,
    hedefBolge: item?.hedef_guvenlikbolgesi.isChecked,
    kaynakAdres: item?.kaynak_adresi.isChecked,
    hedefAdres: item?.hedef_adresi.isChecked,
    servisler: false,
  });

  const handleChange = (e) => {
    const { name, checked: isChecked } = e.target;

    setChecked((prev) => ({
      ...prev,
      [name]: isChecked,
    }));

    console.log(`${name} durumu:`, isChecked);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className="modal bg-black p-6 rounded-lg w-full  shadow-lg "
        style={{ width: "700px" }}
      >
        <div className="head mb-4">
          <h1 className="text-xl font-bold">Firewall Rule Filter</h1>
        </div>
        <div className="content space-y-2">
          <div className="item-title bg-gray-800 p-2 rounded text-white">
            <label htmlFor="item-title " className=" mr-2 pr-2">
              Rule Title:
            </label>
            <input
              id="item-title"
              name="item-title"
              className="bg-gray-700 text-white  rounded"
              onChange={(e) => setTitle(e.target.value)}
            ></input>
          </div>

          <div className="item-description bg-gray-800 p-2 rounded text-white">
            <label htmlFor="item-description" className="mr-2 pr-2">
              Rule Description:
            </label>
            <input
              id="item-description"
              name="item-description"
              className="bg-gray-700 text-white  rounded"
              onChange={(e) => setDescription(e.target.value)}
            ></input>
          </div>

          <div className="kaynak-guvenlik-bolgesi bg-gray-800 p-2 rounded text-white">
            <div className="flex items-center space-x-2 p-2 bg-gray-800 text-white rounded">
              <input
                type="checkbox"
                id="checkbox-kaynak-bolge"
                name="kaynakBolge"
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="checkbox-kaynak-bolge" className="cursor-pointer">
                Listedekiler Hariç
              </label>
            </div>
            <label htmlFor="kaynak-guvenlik-bolgesi " className="mr-2 pr-2">
              Kaynak Güvenlik Bölgesi:
            </label>
            <select
              id="kaynak-guvenlik-bolgesi"
              name="kaynak-guvenlik-bolgesi"
              className="bg-gray-700 text-white  rounded"
              onChange={(e) => setKaynakGuvenlikBolgesi(e.target.value)}
            >
              <option value="LAN">LAN</option>
              <option value="WAN">WAN</option>
              <option value="DMZ">DMZ</option>
              <option value="VPN">VPN</option>
              <option value="GUEST">GUEST</option>
            </select>
          </div>

          <div className="hedef-guvenlik-bolgesi bg-gray-800 p-2 rounded text-white">
            <div className="flex items-center space-x-2 p-2 bg-gray-800 text-white rounded">
              <input
                type="checkbox"
                id="checkbox-hedef-bolge"
                name="hedefBolge"
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="checkbox-hedef-bolge" className="cursor-pointer">
                Listedekiler Hariç
              </label>
            </div>
            <label htmlFor="hedef-guvenlik-bolgesi" className=" mr-2 pr-2">
              Hedef Güvenlik Bölgesi:
            </label>
            <select
              id="hedef-guvenlik-bolgesi"
              name="hedef-guvenlik-bolgesi"
              className="bg-gray-700 text-white rounded"
              onChange={(e) => setHedefGuvenlikBolgesi(e.target.value)}
            >
              <option value="LAN">LAN</option>
              <option value="WAN">WAN</option>
              <option value="DMZ">DMZ</option>
              <option value="VPN">VPN</option>
              <option value="GUEST">GUEST</option>
            </select>
          </div>

          <div className="kaynak-adresi bg-gray-800 p-2 rounded text-white">
            <div className="flex items-center space-x-2 p-2 bg-gray-800 text-white rounded">
              <input
                type="checkbox"
                id="checkbox-kaynak-adres"
                name="kaynakAdres"
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="checkbox-kaynak-adres" className="cursor-pointer">
                Listedekiler Hariç
              </label>
            </div>
            <label htmlFor="kaynak-adresi" className=" mr-2 pr-2">
              Kaynak Adresi:
            </label>
            <input
              id="kaynak-adresi"
              name="kaynak-adresi"
              className="bg-gray-700 text-white rounded"
              onChange={(e) => setKaynakAdresi(e.target.value)}
            ></input>
          </div>

          <div className="hedef-adresi bg-gray-800 p-2 rounded text-white">
            <div className="flex items-center space-x-2 p-2 bg-gray-800 text-white rounded">
              <input
                type="checkbox"
                id="checkbox-hedef-adres"
                name="hedefAdres"
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="checkbox-hedef-adres" className="cursor-pointer">
                Listedekiler Hariç
              </label>
            </div>
            <label htmlFor="hedef-adresi" className=" mr-2 pr-2">
              Hedef Adresi:
            </label>
            <input
              id="hedef-adresi"
              name="hedef-adresi"
              className="bg-gray-700 text-white rounded"
              onChange={(e) => setHedefAdresi(e.target.value)}
            ></input>
          </div>

          <div className="servisler bg-gray-800 p-2 rounded text-white">
            <div className="flex items-center space-x-2 p-2 bg-gray-800 text-white rounded">
              <input
                type="checkbox"
                id="checkbox-servisler"
                name="servisler"
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="checkbox-servisler" className="cursor-pointer">
                Listedekiler Hariç
              </label>
            </div>
            <label htmlFor="servisler" className=" mr-2 pr-2">
              Servisler (http, https):
            </label>
            <select
              name="servisler"
              id="servisler"
              className="bg-gray-700 text-white rounded"
              onChange={(e) => setServisler(e.target.value)}
            >
              <option value="HTTP">HTTP</option>
              <option value="HTTPS">HTTPS</option>
              <option value="FTP">FTP</option>
              <option value="SSH">SSH</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>
        </div>
        <div className="footer flex justify-between mt-6">
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
            Close
          </button>
          <button
            onClick={() => saveRule}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
