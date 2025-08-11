export default function CustomTable({ onEditClick, rules, isFileUploaded }) {
  const hasValue = (obj, key) => {
    return (
      obj?.hasOwnProperty(key) && obj[key] !== undefined && obj[key] !== null
    );
  };

  if (rules && rules.length != 0) {
    return (
      <div className="p-0 w-300 max-h-[500px] fixed justify-center mx-auto space-y-1 overflow-auto">
        <table className=" min-w-full">
          <thead className="">
            <tr className="text-left bg-gray-700 rounded-2xl sticky top-0">
              <th className="pr-3 w-1/10 ">Sıra No</th>
              <th className="p-3 w-2/10">Açıklama</th>
              <th className="pr-10 w-2/10">Kaynak Adres</th>
              <th className="pr-10 w-2/10">Hedef Adres</th>
              <th className="pr-10 w-1/10">Protokoller</th>
              <th className="pr-10 w-2/10">Detaylar</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((item) => (
              <tr key={item.id} className="border-t-2 text-left">
                <td className="">{item.sira_no}</td>

                <td className="">
                  <p className="">{item.aciklama}</p>
                </td>
                <td className="">
                  {item.kaynakAdresleri.map((val, key) => (
                    <p key={key} className=" mt-1">
                      {val.ipAdresi ? val.ipAdresi : val.arayuz_adi}
                    </p>
                  ))}
                </td>
                <td>
                  {item.hedefAdresleri.map((val, key) => (
                    <p key={key} className=" mt-1">
                      {val.ipAdresi ? val.ipAdresi : val.arayuz_adi}
                    </p>
                  ))}
                </td>

                <td>
                  {item.servisler.map((servis) => {
                    <p className="text-white" key={servis.id}>
                      {servis.adi}
                    </p>;
                  })}
                </td>

                <td>
                  {hasValue(item, "detaylar") ? (
                    <div className="flex-1">
                      <div className=" mt-1">
                        {hasValue(item.detaylar, "hedefPortHaricTut") ? (
                          <p className="">
                            <b>Hedef Port Hariç:</b>
                            {String(item.detaylar.hedefPortHaricTut)}
                          </p>
                        ) : (
                          ""
                        )}
                        {hasValue(item.detaylar, "hedefAdresHaricTut") ? (
                          <p className="">
                            <b>Hedef Adres Hariç:</b>
                            {String(item.detaylar.hedefAdresHaricTut)}
                          </p>
                        ) : (
                          ""
                        )}
                        {hasValue(item.detaylar, "kaynakPortHaricTut") ? (
                          <p className="">
                            <b>Kaynak Port Hariç:</b>
                            {String(item.detaylar.kaynakPortHaricTut)}
                          </p>
                        ) : (
                          ""
                        )}
                        {hasValue(item.detaylar, "kaynakAdresHaricTut") ? (
                          <p className="">
                            <b>Kaynak Adres Hariç:</b>
                            {String(item.detaylar.kaynakAdresHaricTut)}
                          </p>
                        ) : (
                          ""
                        )}
                        {hasValue(item.detaylar, "seciliServislerHaricTut") ? (
                          <p className="">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
