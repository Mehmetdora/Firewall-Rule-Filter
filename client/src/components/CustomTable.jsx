import EditButton from "./EditButton";

export default function CustomTable({ onEditClick, rules, isFileUploaded }) {
  const hasValue = (obj, key) => {
    return (
      obj?.hasOwnProperty(key) && obj[key] !== undefined && obj[key] !== null
    );
  };

  if (rules || rules.length != 0) {
    return (
      <div className="p-6 w-300 mx-auto space-y-1">
        {rules.map((item) => (
          <div
            key={item.id}
            className="bg-gray-50 hover:bg-gray-100 border rounded-lg shadow-sm p-4 flex justify-between items-start"
          >
            <div className="flex items-start mr-3">
              <h2 className="text-md font-semibold text-gray-800 tracking-wide">
                Açıklama:
              </h2>
              <div className="ml-1 flex-1">
                <h3 className="text-black text-left  p-0 text-md font-bold mt-1">
                  {item.aciklama}
                </h3>
              </div>
            </div>

            <div className="flex items-start mr-3">
              <h2 className="text-md font-semibold text-gray-800 tracking-wide">
                Sıra NO:
              </h2>
              <div className="ml-1 flex-1 p-0">
                <p className="text-gray-600 p-0 ml-0 text-sm mt-1">
                  {item.sira_no}
                </p>
              </div>
            </div>

            <div className="flex items-start w-full">
              <h2 className="text-md ml-1 font-semibold text-gray-800 tracking-wide">
                Kaynak Adresleri:
              </h2>
              <div className="ml-4 flex-1">
                {item.kaynakAdresleri.map((val, key) => (
                  <p
                    key={key}
                    className="text-gray-600 bg-red-100 text-sm mt-1"
                  >
                    {val.ipAdresi ? val.ipAdresi : val.arayuz_adi}
                  </p>
                ))}
              </div>
            </div>

            <div className="flex items-start w-full">
              <h2 className="text-md ml-4 font-semibold text-gray-800 tracking-wide">
                Hedef Adresi:
              </h2>
              <div className="ml-4 flex-1">
                {item.hedefAdresleri.map((val, key) => (
                  <p
                    key={key}
                    className="text-gray-600 bg-red-100 text-sm mt-1"
                  >
                    {val.ipAdresi ? val.ipAdresi : val.arayuz_adi}
                  </p>
                ))}
              </div>
            </div>
            <div className="flex items-start w-full">
              <h2 className="text-md ml-1 font-semibold text-gray-800 tracking-wide">
                Protokoller:
              </h2>
              <div className="ml-4 flex-1">
                {item.servisler.map((val, key) => (
                  <p
                    key={key}
                    className="text-gray-600 bg-red-100 text-sm mt-1"
                  >
                    {val.adi}
                  </p>
                ))}
              </div>
            </div>

            <div className="flex items-start w-full">
              <h2 className="text-md ml-4 font-semibold text-gray-800 tracking-wide">
                Detaylar:
              </h2>
              {hasValue(item, "detaylar") ? (
                <div className="ml-4 flex-1">
                  <div className="text-gray-600  text-sm mt-1">
                    {hasValue(item.detaylar, "hedefPortHaricTut") ? (
                      <p className="text-black mb-2 bg-red-100 font-bold">
                        <b>Hedef Port Hariç:</b>
                        {String(item.detaylar.hedefPortHaricTut)}
                      </p>
                    ) : (
                      ""
                    )}
                    {hasValue(item.detaylar, "hedefAdresHaricTut") ? (
                      <p className="text-black mb-2 bg-red-100 font-bold">
                        <b>Hedef Adres Hariç:</b>
                        {String(item.detaylar.hedefAdresHaricTut)}
                      </p>
                    ) : (
                      ""
                    )}
                    {hasValue(item.detaylar, "kaynakPortHaricTut") ? (
                      <p className="text-black mb-2 bg-red-100 font-bold">
                        <b>Kaynak Port Hariç:</b>
                        {String(item.detaylar.kaynakPortHaricTut)}
                      </p>
                    ) : (
                      ""
                    )}
                    {hasValue(item.detaylar, "kaynakAdresHaricTut") ? (
                      <p className="text-black mb-2 bg-red-100 font-bold">
                        <b>Kaynak Adres Hariç:</b>
                        {String(item.detaylar.kaynakAdresHaricTut)}
                      </p>
                    ) : (
                      ""
                    )}
                    {hasValue(item.detaylar, "seciliServislerHaricTut") ? (
                      <p className="text-black bg-red-100 mb-2 font-bold">
                        <b>Seçili Servisler Hariç:</b>
                        {String(item.detaylar.seciliServislerHaricTut)}
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-black ml-4 flex-1 mb-2 font-bold">---</p>
              )}
            </div>
            {/* 
          <EditButton onClick={() => onEditClick(item)}></EditButton>
        */}
          </div>
        ))}
      </div>
    );
  }
}
