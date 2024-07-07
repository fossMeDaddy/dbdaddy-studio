import {
  Column,
  ColumnEditorOptions,
  ColumnFilterElementTemplateOptions,
} from "primereact/column";
import {
  DataTable,
  DataTableFilterMeta,
  DataTableRowEditCompleteEvent,
} from "primereact/datatable";
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
import { InputText } from "primereact/inputtext";
import { fetchTableData } from "../utils/fetchTableData";
import { DataObject } from "../model/types";

const ShowTable = ({ table, schema }: { table: string; schema: string }) => {
  const [defaultFilters, setDefaultFilters] = useState<DataTableFilterMeta>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [tableRows, setTableRows] = useState<Record<string, string>[]>([]);
  const [selectedRows, setSelectedRows] = useState<Record<string, string>[]>(
    []
  );
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<Record<string, string>[]>>(null);
  const { data, loading } = useFetchTableData(schema, table);
  const { schemaData, schemaLoading } = useFetchTableSchema(schema, table);
  const [queried, setQueried] = useState<Record<string, string>[]>([]);
  const [show, setShow] = useState<boolean>(false);
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
  // useEffect(() => {
  //   if (data && schemaData) {
  //     const transformedData = transformData(data);
  //     const initialFilters = initializeFilters(data, schemaData);
  //     setTableRows(transformedData);
  //     // setColumns(Object.keys(data));
  //     // setFilters((prevFilters) => ({
  //     //   ...prevFilters,
  //     //   ...initialFilters,
  //     // }));
  //     setDefaultFilters((prevFilters) => ({
  //       ...prevFilters,
  //       ...initialFilters,
  //     }));
  //   }
  // }, [data]);
  useEffect(() => {
    const data = fetchTableData(schema, table);
    const transformedData = transformData(data);
    const initialFilters = initializeFilters(data, schemaData);
    setTableRows(transformedData);
    // setColumns(Object.keys(data));
    // setFilters((prevFilters) => ({
    //   ...prevFilters,
    //   ...initialFilters,
    // }));
    setDefaultFilters((prevFilters) => ({
      ...prevFilters,
      ...initialFilters,
    }));
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
          schema={schema}
          setQueried={setQueried}
          setShow={setShow}
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
        {/* <Button
          icon="pi pi-pencil"
          rounded
          outlined
          className="mr-2"
          // onClick={}
        /> */}
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

  const onRowEditComplete = (e: DataTableRowEditCompleteEvent) => {
    let _tableRows = [...tableRows];
    let { newData, index } = e;

    _tableRows[index] = newData as Record<string, string>;

    setTableRows(_tableRows);
  };

  const textEditor = (options: ColumnEditorOptions) => {
    return (
      <InputText
        type="text"
        value={options.value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          options.editorCallback!(e.target.value)
        }
      />
    );
  };
  // const dateFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
  //   return (
  //     <Calendar
  //       value={options.value}
  //       onChange={(e) => {
  //         const selectedDate = e.value as Date | null;
  //         options.filterCallback(selectedDate, options.index);
  //       }}
  //       dateFormat="mm/dd/yy"
  //       placeholder="mm/dd/yyyy"
  //       mask="99/99/9999"
  //     />
  //   );
  // };
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
          value={!show ? tableRows : queried}
          dataKey="id"
          className="p-2 w-full"
          // tableStyle={{ minWidth: "50rem" }}
          paginator
          showGridlines
          rows={5}
          header={header}
          removableSort
          resizableColumns
          selection={selectedRows}
          onSelectionChange={(e) => {
            if (Array.isArray(e.value)) {
              setSelectedRows(e.value);
            }
          }}
          selectionMode="multiple"
          editMode="row"
          onRowEditComplete={onRowEditComplete}
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
                  dataType="date"
                  // filterPlaceholder={`Search by ${col}`}
                  style={{ width: "25%" }}
                  editor={(options) => textEditor(options)}
                  // body={(rowData: Record<string, string>) =>
                  //   dateBodyTemplate(rowData, col.Name)
                  // }
                  // filter
                />
              );
            } else {
              return (
                <Column
                  key={col.Name}
                  field={col.Name.toLocaleLowerCase()}
                  header={col.Name}
                  editor={(options) => textEditor(options)}
                  style={{ width: "25%" }}
                />
              );
            }
          })}
          <Column
            // body={actionBodyTemplate}
            rowEditor={true}
            exportable={false}
            style={{ minWidth: "12rem" }}
          ></Column>
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
