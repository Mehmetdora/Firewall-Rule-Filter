import { useState } from "react";

export default function AnalizSonucModal({
  isAnalysisModalClose,
  analysis,
  setModalClose,
}) {
  // veriler varsa ve kapalı değilse analiz modal ını göster

  console.log("Analizler:",analysis);
  
  return (
    <>
      {analysis && isAnalysisModalClose == false ? (
        <div className="fixed flex items-center h-170 z-50">
          <div className="bg-white  shadow-lg rounded-2xl pt-2 pb-2 dark:bg-gray-700 w-300 relative">
            <div className="flex justify-end mb-2">
              <div className="w-9/10 ml-3 text-start"><b>Toplam Analiz Sayısı: {analysis.length} <br/> </b></div>
              <div className="w-1/10 flex">
                <button
                  className=" text-sm "
                  onClick={() => setModalClose(true)}
                >
                  Kapat
                </button>
              </div>
            </div>
            <div className="relative rounded-2xl h-170 overflow-y-auto">
              <table className="w-full text-m text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-md text-white sticky top-0 uppercase bg-gray-50 dark:bg-gray-700 dark:text-white">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Sıra
                    </th>
                    <th scope="col" className=" py-3">
                      Açıklama
                    </th>
                    <th scope="col" className=" py-3">
                      Analiz sonucu
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.map((analiz, key) => {
                    return (
                      <tr
                        key={key}
                        className="bg-white border-b w-5 dark:bg-gray-800 dark:border-gray-700 border-gray-200"
                      >
                        <th
                          scope="row"
                          className="px-6 py-2 w-1/10 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          {analiz.rule2_sira_no}
                        </th>
                        <td className=" w-3/10 py-1">
                          <b>1. Kural Açıklaması:</b> {analiz.rule1_aciklama}{" "}
                          <br />
                          <b>2. Kural Açıklaması:</b> {analiz.rule2_aciklama}
                        </td>
                        <td className=" w-7/10 py-1">
                          <b>
                            {analiz.rule1_sira_no}. sıradaki kuralın %
                            {analiz.rule1_conflict} kadarı{" "}
                            {analiz.rule2_sira_no}. sıradaki kuralın %
                            {analiz.rule2_conflict} kadarını ezmektedir.
                          </b>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
}
