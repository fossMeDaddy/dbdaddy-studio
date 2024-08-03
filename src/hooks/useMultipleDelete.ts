// multipleDeleteUtils.ts
import { Toast } from "primereact/toast";
import { useState } from "react";
import { executeQuery } from "../utils/executeQuery";

export const useMultipleDelete = (
  tableRows: Record<string, string>[],
  setTableRows: React.Dispatch<React.SetStateAction<Record<string, string>[]>>,
  selectedRows: Record<string, string>[],
  setSelectedRows: React.Dispatch<
    React.SetStateAction<Record<string, string>[]>
  >,
  toast: React.RefObject<Toast>,
  schema: string,
  table: string,
  primaryKey: string
) => {
  const [deleteRowsDialog, setDeleteRowsDialog] = useState<boolean>(false);

  const confirmDeleteSelected = () => {
    setDeleteRowsDialog(true);
  };

  const hideDeleteRowsDialog = () => {
    setDeleteRowsDialog(false);
  };

  const deleteSelectedRows = async () => {
    let _tableRows = tableRows.filter((val) => !selectedRows.includes(val));
    let query = `delete from ${schema}.${table} where ${primaryKey} in (`;
    selectedRows.forEach((val, ind) => {
      query += "'";
      query += val[primaryKey];
      query += "'";
      if (ind != selectedRows.length - 1) {
        query += ",";
      }
    });
    query += ")";
    console.log(query);
    const message = await executeQuery(query);
    if (message == "success") {
      setTableRows(_tableRows);
      setDeleteRowsDialog(false);
      setSelectedRows([]);
      toast.current?.show({
        severity: "success",
        summary: "Successful",
        detail: "Rows Deleted",
        life: 3000,
      });
    } else {
      toast.current?.show({
        severity: "error",
        summary: "Failed",
        detail: "Failed to delete",
        life: 3000,
      });
    }
  };

  return {
    deleteRowsDialog,
    confirmDeleteSelected,
    hideDeleteRowsDialog,
    deleteSelectedRows,
  };
};
