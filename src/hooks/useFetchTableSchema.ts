import { useState, useEffect } from "react";
export interface ColumnType {
  Name: string;
  Default: string;
  Nullable: boolean;
  DataType: string;
  IsPrimaryKey: boolean;
}
const useFetchTableSchema = (schema: string, table: string) => {
  const [data, setData] = useState<ColumnType[]>([]);
  const [loading, setLoading] = useState(true);
  const [primaryKey, setPrimaryKey] = useState<string>("");
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `http://127.0.0.1:42069/table/${schema}/${table}/schema`
      );
      const result = await response.json();
      setData(result.Data.Columns);
      setLoading(false);
      const primaryKeyColumn = result.Data.Columns.find(
        (col: ColumnType) => col.IsPrimaryKey
      );
      if (primaryKeyColumn) {
        setPrimaryKey(primaryKeyColumn.Name);
      }
    };

    fetchData();
  }, [schema, table]);

  return { schemaData: data, schemaLoading: loading, primaryKey: primaryKey };
};

export default useFetchTableSchema;
