import { Column } from "primereact/column";
import { DataTable, DataTableFilterMeta } from "primereact/datatable";
import React, { useEffect, useRef, useState } from "react";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Tooltip } from "primereact/tooltip";
import { Toolbar } from "primereact/toolbar";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import useFetchTableData from "../hooks/useFetchTableData";
import { transformData } from "../utils/tranformDataUtils";
import {
  clearFilters,
  initializeFilters,
  onGlobalFilterChange,
} from "../utils/filterUtils";
import TableHeader from "./TableToolbar";

// interface DataItem {
//   DataType: string;
//   StrValue: string;
// }
// interface DataObject {
//   [key: string]: DataItem[];
// }

const ShowTable = ({ table, schema }: { table: string; schema: string }) => {
  const [defaultFilters, setDefaultFilters] = useState<DataTableFilterMeta>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [tableRows, setTableRows] = useState<Record<string, string>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [filters, setFilters] = useState<DataTableFilterMeta>(defaultFilters);
  const [globalFilterValue, setGlobalFilterValue] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<Record<string, string>[]>(
    []
  );
  const [row, setRow] = useState<Record<string, string> | null>(null);
  const [deleteRowDialog, setDeleteRowDialog] = useState<boolean>(false);
  const [deleteRowsDialog, setDeleteRowsDialog] = useState<boolean>(false);
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<Record<string, string>[]>>(null);
  const { data, loading } = useFetchTableData(schema, table);

  //data tranformation
  // const transformData = (data: DataObject): Record<string, string>[] => {
  //   const result: Record<string, string>[] = [];
  //   const columns = Object.keys(data);
  //   const initialFilters: DataTableFilterMeta = {};

  //   columns.forEach((col) => {
  //     initialFilters[col] = {
  //       operator: FilterOperator.AND,
  //       constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  //     };
  //   });
  //   setFilters((prevFilters) => ({
  //     ...prevFilters,
  //     ...initialFilters,
  //   }));
  //   setDefaultFilters((prevFilters) => ({
  //     ...prevFilters,
  //     ...initialFilters,
  //   }));
  //   setColumns(columns);
  //   const itemCount = data[columns[0]].length;
  //   for (let i = 0; i < itemCount; i++) {
  //     const row: Record<string, string> = {};
  //     columns.forEach((column) => {
  //       row[column] = data[column][i]["StrValue"];
  //     });
  //     result.push(row);
  //   }

  //   return result;
  // };

  //initially getting data
  // useEffect(() => {
  //   const getTableRows = async () => {
  //     const response = await fetch(
  //       `http://127.0.0.1:42069/table/${schema}/${table}/rows`
  //     );
  //     const data = await response.json();
  //     const tableData = data.Data;
  //     const tranformedTableData = transformData(tableData);
  //     setTableRows(tranformedTableData);
  //   };
  //   getTableRows();
  // }, [schema, table]);
  useEffect(() => {
    if (data) {
      const transformedData = transformData(data);
      const initialFilters = initializeFilters(data);
      setTableRows(transformedData);
      setColumns(Object.keys(data));
      setFilters((prevFilters) => ({
        ...prevFilters,
        ...initialFilters,
      }));
      setDefaultFilters((prevFilters) => ({
        ...prevFilters,
        ...initialFilters,
      }));
    }
  }, [data]);
  //Filter Stuff
  // const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = e.target.value;
  //   let _filters = { ...filters };
  //   //@ts-ignore
  //   _filters["global"].value = value;
  //   setFilters(_filters);
  //   setGlobalFilterValue(value);
  // };
  // const clearFilters = () => {
  //   let _filters = { ...filters };
  //   //@ts-ignore
  //   _filters["global"].value = "";
  //   setFilters(_filters);
  //   setGlobalFilterValue("");
  // };

  //Exporting csv
  const exportCSV = () => {
    dt.current?.exportCSV();
  };

  //Single Row Delete
  const hideDeleteRowDialog = () => {
    setDeleteRowDialog(false);
  };

  const confirmDeleteRow = (row: Record<string, string>) => {
    setRow(row);
    setDeleteRowDialog(true);
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
  const deleteRowDialogFooter = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        outlined
        onClick={hideDeleteRowDialog}
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        severity="danger"
        onClick={deleteRow}
      />
    </React.Fragment>
  );

  //Multiple Rows Delete
  const confirmDeleteSelected = () => {
    setDeleteRowsDialog(true);
  };

  const deleteSelectedProducts = () => {
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
  const hideDeleteRowsDialog = () => {
    setDeleteRowsDialog(false);
  };
  const deleteRowsDialogFooter = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        outlined
        onClick={hideDeleteRowsDialog}
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        severity="danger"
        onClick={deleteSelectedProducts}
      />
    </React.Fragment>
  );
  //Header for datatable
  const renderHeader = () => {
    return (
      <>
        <TableHeader
          table={table}
          globalFilterValue={globalFilterValue}
          onGlobalFilterChange={(e) =>
            onGlobalFilterChange(e, filters, setFilters, setGlobalFilterValue)
          }
          clearFilters={() =>
            clearFilters(filters, setFilters, setGlobalFilterValue)
          }
        ></TableHeader>
        {/* <div className="flex justify-content-between">
          <Button
            type="button"
            icon="pi pi-filter-slash"
            label="Clear"
            outlined
            onClick={() =>
              clearFilters(filters, setFilters, setGlobalFilterValue)
            }
          />
          <div>
            <h2 className="text-center text-3xl">{table}</h2>
          </div>
          {/* <div className="flex gap-2"> */}
        {/* <div className="p-input-icon-left"> */}
        {/* <IconField iconPosition="left">
              <InputIcon className="pi pi-search" />
              <InputText
                value={globalFilterValue}
                onChange={(e) =>
                  onGlobalFilterChange(
                    e,
                    filters,
                    setFilters,
                    setGlobalFilterValue
                  )
                }
                placeholder="Keyword Search"
              />
            </IconField>
          </div> */}
        {/* <div> */}
        {/* <Button
                type="button"
                icon="pi pi-file"
                rounded
                onClick={() => exportCSV(false)}
                tooltip="CSV"
                tooltipOptions={{ position: "bottom" }}
              />
            </div> */}
        {/* </div> */}
        {/* </div> */}
      </>
    );
  };

  const header = renderHeader();
  const startContent = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          label="New"
          icon="pi pi-plus"
          severity="success"
          // onClick={openNew}
        />
        <Button
          label="Delete"
          icon="pi pi-trash"
          severity="danger"
          onClick={confirmDeleteSelected}
          disabled={!selectedRows || !selectedRows.length}
        />
      </div>
    );
  };
  const endContent = () => {
    return (
      <Button
        label="Export"
        icon="pi pi-upload"
        className="p-button-help"
        onClick={exportCSV}
        tooltip="CSV"
        tooltipOptions={{ position: "bottom" }}
      />
    );
  };
  const actionBodyTemplate = (rowData: Record<string, string>) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-pencil"
          rounded
          outlined
          className="mr-2"
          // onClick={() => editProduct(rowData)}
        />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          onClick={() => confirmDeleteRow(rowData)}
        />
      </React.Fragment>
    );
  };
  return (
    <div>
      <Toast ref={toast} />
      <div className="h-full w-full">
        <Toolbar
          className="m-2 p-2"
          start={startContent}
          end={endContent}
        ></Toolbar>
        <DataTable
          ref={dt}
          value={tableRows}
          dataKey="id"
          className="p-2 w-full"
          // tableStyle={{ minWidth: "50rem" }}
          paginator
          showGridlines
          rows={5}
          header={header}
          filters={filters}
          removableSort
          resizableColumns
          globalFilterFields={columns}
          selection={selectedRows}
          onSelectionChange={(e) => {
            if (Array.isArray(e.value)) {
              setSelectedRows(e.value);
            }
          }}
          selectionMode="multiple"
          emptyMessage="No data found."
        >
          <Column selectionMode="multiple" exportable={false}></Column>
          {columns.map((col) => (
            <Column
              key={col}
              field={col.toLocaleLowerCase()}
              header={col}
              sortable
              filter
              filterPlaceholder={`Search by ${col}`}
              style={{ width: "25%" }}
            />
          ))}
          <Column
            body={actionBodyTemplate}
            exportable={false}
            style={{ minWidth: "12rem" }}
          ></Column>
        </DataTable>
      </div>
      <Dialog
        visible={deleteRowDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={deleteRowDialogFooter}
        onHide={hideDeleteRowDialog}
      >
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {row && <span>Are you sure you want to delete this row?</span>}
        </div>
      </Dialog>
      <Dialog
        visible={deleteRowsDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={deleteRowsDialogFooter}
        onHide={hideDeleteRowsDialog}
      >
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {selectedRows && (
            <span>Are you sure you want to delete the selected rows?</span>
          )}
        </div>
      </Dialog>
    </div>
  );
};
export default ShowTable;
