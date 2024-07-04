import { useState, useEffect } from "react";
export interface ColumnType {
  Name: string;
  Default: string;
  Nullable: boolean;
  DataType: string;
}
const useFetchTableSchema = (schema: string, table: string) => {
  const [data, setData] = useState<ColumnType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `http://127.0.0.1:42069/table/${schema}/${table}/schema`
      );
      const result = await response.json();
      setData(result.Data.Columns);
      setLoading(false);
    };

    fetchData();
  }, [schema, table]);

  return { schemaData: data, schemaLoading: loading };
};

export default useFetchTableSchema;
