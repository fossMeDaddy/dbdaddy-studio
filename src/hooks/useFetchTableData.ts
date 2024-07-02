import { useState, useEffect } from "react";

const useFetchTableData = (schema: string, table: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `http://127.0.0.1:42069/table/${schema}/${table}/rows`
      );
      const result = await response.json();
      setData(result.Data);
      setLoading(false);
    };

    fetchData();
  }, [schema, table]);

  return { data, loading };
};

export default useFetchTableData;
