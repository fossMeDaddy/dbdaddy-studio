import { Column, ColumnFilterElementTemplateOptions } from "primereact/column";
import { DataTable, DataTableFilterMeta } from "primereact/datatable";
import React, { useEffect, useRef, useState } from "react";
import { FilterMatchMode } from "primereact/api";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Toast } from "primereact/toast";
import useFetchTableData from "../hooks/useFetchTableData";
import { transformData } from "../utils/tranformDataUtils";
import {
  clearFilters,
  initializeFilters,
  onGlobalFilterChange,
} from "../utils/filterUtils";
import TableHeader from "./TableToolbar";
import { useSingleDelete } from "../hooks/useSingleDelete";
import { useMultipleDelete } from "../hooks/useMultipleDelete";
import DeleteRowDialog from "./DeleteRowDialog";
import DeleteRowsDialog from "./DeleteRowsDialog";
import useFetchTableSchema from "../hooks/useFetchTableSchema";
import { Calendar } from "primereact/calendar";

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
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<Record<string, string>[]>>(null);
  const { data, loading } = useFetchTableData(schema, table);
  const { schemaData, schemaLoading } = useFetchTableSchema(schema, table);
  //single row delete
  const {
    // row,
    deleteRowDialog,
    confirmDeleteRow,
    hideDeleteRowDialog,
    deleteRow,
  } = useSingleDelete(tableRows, setTableRows, toast);
  //multiple rows delete
  const {
    deleteRowsDialog,
    confirmDeleteSelected,
    hideDeleteRowsDialog,
    deleteSelectedRows,
  } = useMultipleDelete(
    tableRows,
    setTableRows,
    selectedRows,
    setSelectedRows,
    toast
  );
  //initially getting data
  useEffect(() => {
    if (data && schemaData) {
      const transformedData = transformData(data);
      const initialFilters = initializeFilters(data, schemaData);
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

  //Exporting csv
  const exportCSV = () => {
    dt.current?.exportCSV();
  };

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
  const formatDate = (value: string) => {
    const trimmedDateString = value.split(" ")[0]; // Remove the timezone information

    const dateObject = new Date(trimmedDateString);
    return dateObject.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  const dateBodyTemplate = (
    rowData: Record<string, string>,
    colName: string
  ) => {
    return formatDate(rowData[colName]);
  };

  const dateFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
    return (
      <Calendar
        value={options.value}
        onChange={(e) => {
          const selectedDate = e.value as Date | null;
          options.filterCallback(selectedDate, options.index);
        }}
        dateFormat="mm/dd/yy"
        placeholder="mm/dd/yyyy"
        mask="99/99/9999"
      />
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
          {schemaData.map((col) => {
            if (col.DataType == "timestamp" || col.DataType == "timestamptz") {
              return (
                <Column
                  key={col.Name}
                  field={col.Name.toLocaleLowerCase()}
                  header={col.Name}
                  filterField={col.Name}
                  dataType="date"
                  sortable
                  filter
                  // filterPlaceholder={`Search by ${col}`}
                  style={{ width: "25%" }}
                  body={(rowData: Record<string, string>) =>
                    dateBodyTemplate(rowData, col.Name)
                  }
                  // filter
                  filterElement={dateFilterTemplate}
                />
              );
            } else {
              return (
                <Column
                  key={col.Name}
                  field={col.Name.toLocaleLowerCase()}
                  header={col.Name}
                  sortable
                  filter
                  filterPlaceholder={`Search by ${col.Name}`}
                  style={{ width: "25%" }}
                />
              );
            }
          })}
          <Column
            body={actionBodyTemplate}
            exportable={false}
            style={{ minWidth: "12rem" }}
          ></Column>
        </DataTable>
      </div>
      <DeleteRowDialog
        visible={deleteRowDialog}
        onHide={hideDeleteRowDialog}
        onDelete={deleteRow}
      />
      <DeleteRowsDialog
        visible={deleteRowsDialog}
        onHide={hideDeleteRowsDialog}
        onDelete={deleteSelectedRows}
      />
    </div>
  );
};
export default ShowTable;
