import { useEffect, useState } from "react";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { ScrollPanel } from "primereact/scrollpanel";
import "../styles/ScrollBar.css";
import { PanelMenu } from "primereact/panelmenu";
import ShowTable from "./ShowTable";

interface TableData {
  Name: string;
  Schema: string;
}
const Home = () => {
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [tables, setTables] = useState<
    {
      label: string;
      items: {
        label: string;
        command: () => void;
      }[];
    }[]
  >([]);
  const [show, setShow] = useState<string>("");
  const [schema, setSchema] = useState<string>("");
  const fetchBranches = async () => {
    try {
      const response = await fetch("http://127.0.0.1:42069/branches");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  };
  const transformTables = (
    tables: Record<string, string[]>
  ): { label: string; items: { label: string; command: () => void }[] }[] => {
    return Object.keys(tables).map((schemaName) => ({
      label: schemaName,
      items: tables[schemaName].map((tableName) => ({
        label: tableName,
        command: () => {
          setShow(tableName);
          setSchema(schemaName);
        },
      })),
    }));
  };
  const getTables = async () => {
    const response = await fetch("http://127.0.0.1:42069/tables");
    const data = await response.json();
    const schemaTables: { [schema: string]: string[] } = {};

    data.Data.forEach((entry: TableData) => {
      const { Schema, Name } = entry;
      if (!schemaTables[Schema]) {
        schemaTables[Schema] = [];
      }
      schemaTables[Schema].push(Name);
    });
    const transformedTables = transformTables(schemaTables);
    setTables(transformedTables);
  };
  const changeCurrentBranch = async (branch: string) => {
    const requestOptions: RequestInit = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BranchName: branch,
      }),
    };

    try {
      const response = await fetch(
        "http://127.0.0.1:42069/current-branch",
        requestOptions
      );
      if (!response.ok) {
        throw new Error("Failed to update current branch");
      }
      const responseData = await response.json();

      if (responseData.Message === "success") {
        console.log("Current branch updated successfully");
      } else {
        console.log("Current branch update failed");
      }
    } catch (error) {
      console.error("Error updating current branch:", error);
    }
  };
  const handleChange = async (e: DropdownChangeEvent) => {
    await changeCurrentBranch(e.value);
    await getTables();
    setSelectedBranch(e.value);
  };
  useEffect(() => {
    const getDbs = async () => {
      try {
        const data = await fetchBranches();
        const filteredBranches = data.Data.filter(
          (branch: string) => branch !== "__daddys_home"
        );
        setBranches(filteredBranches);
      } catch (error) {
        console.error("Fetch error:", error);
        throw error;
      }
    };
    const getCurrentBranch = async () => {
      try {
        const response = await fetch("http://127.0.0.1:42069/current-branch");
        const data = await response.json();
        setSelectedBranch(data.Data);
        await getTables();
      } catch (error) {
        console.error("Fetch error:", error);
        throw error;
      }
    };
    getCurrentBranch();
    getDbs();
  }, []);
  return (
    <div className="h-full flex text-xl font-medium">
      <div className="h-full border-r-4 w-[20%]">
        <div className="h-[20%] border-b-2 pt-4">
          <h2 className="text-3xl pl-4 mb-2">Branches</h2>
          <div className="px-4 w-[80%]">
            {branches.length != 0 ? (
              <Dropdown
                value={selectedBranch}
                onChange={(e: DropdownChangeEvent) => handleChange(e)}
                options={branches}
                placeholder="select a branch"
                filter
                className="w-full md:w-[80%]"
              />
            ) : (
              <Dropdown
                loading
                placeholder="Loading..."
                className="w-full md:w-[80%]"
              />
            )}
          </div>
        </div>
        <div className="h-[80%]">
          <ScrollPanel className="h-full custombar1">
            <h2 className="text-2xl md:pl-4 pl-2 py-2">Table Schemas</h2>
            {tables.length !== 0 ? (
              <PanelMenu
                model={tables}
                className="md:w-[80%] w-[70%] mt-2 md:ml-4 ml-2"
              />
            ) : (
              <p>No tables found.</p>
            )}
          </ScrollPanel>
        </div>
      </div>

      <div className="h-full w-[80%] overflow-y-auto">
        {show ? <ShowTable table={show} schema={schema} /> : ""}
      </div>
    </div>
  );
};

export default Home;
