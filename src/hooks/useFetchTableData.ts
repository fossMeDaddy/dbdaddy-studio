import { useState, useEffect } from "react";

const useFetchTableData = (schema: string, table: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      let query = `select * from ${schema}.${table}`;
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

        setData(responseData.Data);
        setLoading(false);
      } catch (error) {
        console.error("Error Fetching Data:", error);
      }
    };

    fetchData();
  }, [schema, table]);

  return { data, loading };
};

export default useFetchTableData;
