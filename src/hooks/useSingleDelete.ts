// singleDeleteUtils.ts
import { Toast } from "primereact/toast";
import { useState } from "react";

export const useSingleDelete = (
  tableRows: Record<string, string>[],
  setTableRows: React.Dispatch<React.SetStateAction<Record<string, string>[]>>,
  toast: React.RefObject<Toast>
) => {
  const [row, setRow] = useState<Record<string, string> | null>(null);
  const [deleteRowDialog, setDeleteRowDialog] = useState<boolean>(false);

  const confirmDeleteRow = (rowData: Record<string, string>) => {
    setRow(rowData);
    setDeleteRowDialog(true);
  };

  const hideDeleteRowDialog = () => {
    setDeleteRowDialog(false);
  };

  const deleteRow = () => {
    let _tableRows = tableRows.filter((val) => val.id !== row?.id);
    setTableRows(_tableRows);
    setDeleteRowDialog(false);
    setRow(null);
    toast.current?.show({
      severity: "success",
      summary: "Successful",
      detail: "Row Deleted",
      life: 3000,
    });
  };

  return {
    row,
    deleteRowDialog,
    confirmDeleteRow,
    hideDeleteRowDialog,
    deleteRow,
  };
};
