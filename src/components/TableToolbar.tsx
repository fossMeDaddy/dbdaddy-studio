import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useState } from "react";
import { transformData } from "../utils/tranformDataUtils";

const TableHeader = ({
  table,
  schema,
  setQueried,
  setShow,
}: {
  table: string;
  schema: string;
  setQueried: React.Dispatch<React.SetStateAction<Record<string, string>[]>>;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [queryPart, setQueryPart] = useState<string>("");

  const fetchData = async () => {
    let query = `select * from ${schema}.${table} `;
    if (queryPart.length != 0) {
      query = query + queryPart;
    }
    console.log(query);
    const requestOptions: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
      }),
    };

    try {
      const response = await fetch(
        "http://127.0.0.1:42069/exec",
        requestOptions
      );
      if (!response.ok) {
        throw new Error("Failed to get Data");
      }
      const responseData = await response.json();
      const transformedData = transformData(responseData.Data);
      setQueried(transformedData);
      setShow(true);
    } catch (error) {
      console.error("Error Fetching Data:", error);
    }
  };
  return (
    <div className="flex justify-content-between">
      <div className="w-full">
        <div>
          <h2 className="text-center text-3xl">{table}</h2>
        </div>
        <div className="flex justify-center items-center p-2">
          <code className="w-[25%]">select * from {table}</code>

          <InputText
            value={queryPart}
            onChange={(e) => setQueryPart(e.target.value)}
            placeholder="Type Query"
            className="w-[55%]"
          />
          <div className="w-[20%] pl-2 flex justify-around">
            <Button
              label="Run"
              icon="pi pi-check"
              size="small"
              onClick={fetchData}
            />
            <Button
              label="Reset"
              icon="pi pi-refresh"
              size="small"
              onClick={() => {
                setQueried([]);
                setQueryPart("");
                setShow(false);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableHeader;
