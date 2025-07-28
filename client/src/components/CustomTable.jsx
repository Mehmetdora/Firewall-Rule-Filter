import EditButton from "./EditButton";

export default function CustomTable({ onEditClick, rules }) {
  return (
    <div className="p-6 w-300 mx-auto space-y-1">
      {rules.map((item) => (
        <div
          key={item.id}
          className="bg-gray-50 hover:bg-gray-100 border rounded-lg shadow-sm p-4 flex justify-between items-start"
        >
          

          {/* <div className="flex items-start w-full">
            <h2 className="text-md ml-4 font-semibold text-gray-800 uppercase tracking-wide">
              Kaynak Adresi:
            </h2>
            <div className="ml-4 flex-1">
              <p className="text-gray-600 text-sm mt-1">
                {item.kaynakAdres[0].ipAdresi}
              </p>
              <span className="text-gray-400 text-xs">
                {item.kaynakAdres[1].ipAdresi}
              </span>
            </div>
          </div>

          <div className="flex items-start w-full">
            <h2 className="text-md ml-4 font-semibold text-gray-800 uppercase tracking-wide">
              Kaynak Adresi:
            </h2>
            <div className="ml-4 flex-1">
              <p className="text-gray-600 text-sm mt-1">
                {item.hedefAdres[0].ipAdresi}
              </p>
              <span className="text-gray-400 text-xs">
                {item.hedefAdres[1].ipAdresi}
              </span>
            </div>
          </div> */}

          {/* 
          <EditButton onClick={() => onEditClick(item)}></EditButton>
        */}
        </div>
      ))}
    </div>
  );
}
