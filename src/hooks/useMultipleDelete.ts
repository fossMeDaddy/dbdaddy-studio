// multipleDeleteUtils.ts
import { Toast } from "primereact/toast";
import { useState } from "react";

export const useMultipleDelete = (
  tableRows: Record<string, string>[],
  setTableRows: React.Dispatch<React.SetStateAction<Record<string, string>[]>>,
  selectedRows: Record<string, string>[],
  setSelectedRows: React.Dispatch<
    React.SetStateAction<Record<string, string>[]>
  >,
  toast: React.RefObject<Toast>
) => {
  const [deleteRowsDialog, setDeleteRowsDialog] = useState<boolean>(false);

  const confirmDeleteSelected = () => {
    setDeleteRowsDialog(true);
  };

  const hideDeleteRowsDialog = () => {
    setDeleteRowsDialog(false);
  };

  const deleteSelectedRows = () => {
    let _tableRows = tableRows.filter((val) => !selectedRows.includes(val));

    setTableRows(_tableRows);
    setDeleteRowsDialog(false);
    setSelectedRows([]);
    toast.current?.show({
      severity: "success",
      summary: "Successful",
      detail: "Rows Deleted",
      life: 3000,
    });
  };

  return {
    deleteRowsDialog,
    confirmDeleteSelected,
    hideDeleteRowsDialog,
    deleteSelectedRows,
  };
};
