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
import { useQuery } from "react-query";
import { Skeleton } from "primereact/skeleton";
import { executeQuery } from "../utils/executeQuery";

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
  // const { data, loading } = useFetchTableData(schema, table);
  const { schemaData, schemaLoading, primaryKey } = useFetchTableSchema(
    schema,
    table
  );

  console.log(schemaLoading);
  const [queried, setQueried] = useState<Record<string, string>[]>([]);
  const [show, setShow] = useState<boolean>(false);
  const dummySchema = [
    "id",
    "created_at",
    "updated_at",
    "name",
    "date_of_birth",
  ];
  const dummyData: Record<string, string>[] = [
    {
      id: "1",
      created_at: Date.now().toLocaleString(),
      updated_at: Date.now().toLocaleString(),
      name: "John",
      date_of_birth: "22/12/2004",
    },
    {
      id: "2",
      created_at: Date.now().toLocaleString(),
      updated_at: Date.now().toLocaleString(),
      name: "John",
      date_of_birth: "22/12/2004",
    },
  ];
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
    toast,
    schema,
    table,
    primaryKey
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
  const { data, error, isLoading } = useQuery(
    ["tableData", schema, table],
    () => fetchTableData(schema, table),
    {
      refetchOnWindowFocus: false,
      enabled: !!schema && !!table,
      onSuccess: (data) => {
        const transformedData = transformData(data);
        console.log("hello");
        const initialFilters = initializeFilters(data, schemaData);
        setTableRows(transformedData);
        setDefaultFilters((prevFilters) => ({
          ...prevFilters,
          ...initialFilters,
        }));
      }, // only run the query if schema and table are defined
    }
  );
  // useEffect(() => {
  //   const fetchData = async () => {
  //     const data = await fetchTableData(schema, table);
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
  //   };
  //   fetchData();
  // }, [schema, table]);

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
          setTableRows={setTableRows}
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

  const onRowEditComplete = async (e: DataTableRowEditCompleteEvent) => {
    let _tableRows = [...tableRows];
    let { newData, index } = e;
    let query = `UPDATE ${schema}.${table} SET `;
    const keys = Object.keys(newData);
    keys.forEach((key, ind) => {
      if (key !== primaryKey && newData[key] != _tableRows[index][key]) {
        const value = newData[key];
        const formattedValue = typeof value === "string" ? `'${value}'` : value;
        query += `"${key}" = ${formattedValue}`;
        query += ", ";
      }
    });
    query = query.slice(0, query.length - 2);
    query += ` WHERE ${primaryKey} = '${newData[primaryKey]}'`;
    console.log(query);
    const message = await executeQuery(query);
    _tableRows[index] = newData as Record<string, string>;
    if (message == "success") {
      setTableRows(_tableRows);
      toast.current?.show({
        severity: "success",
        summary: "Successful",
        detail: "Rows Updated",
        life: 3000,
      });
    } else {
      toast.current?.show({
        severity: "error",
        summary: "Failed",
        detail: "Failed to update",
        life: 3000,
      });
    }
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
  // {
  //   primaryKey ? console.log(primaryKey) : "";
  // }
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
          size="small"
          value={isLoading ? dummyData : tableRows}
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
          <Column
            selectionMode="multiple"
            exportable={false}
            body={isLoading ? <Skeleton /> : ""}
          ></Column>
          {isLoading || schemaLoading
            ? dummySchema.map((col) => {
                return (
                  <Column
                    key={col}
                    field={col.toLocaleLowerCase()}
                    header={"--------"}
                    editor={(options) => textEditor(options)}
                    style={{ width: "25%" }}
                    body={<Skeleton />}
                  ></Column>
                );
              })
            : schemaData.map((col) => {
                if (
                  col.DataType == "timestamp" ||
                  col.DataType == "timestamptz"
                ) {
                  return (
                    <Column
                      key={col.Name}
                      field={col.Name.toLocaleLowerCase()}
                      header={col.Name}
                      dataType="date"
                      // filterPlaceholder={`Search by ${col}`}
                      style={{ width: "25%" }}
                      editor={(options) => textEditor(options)}
                      body={isLoading ? <Skeleton /> : ""}
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
                      body={isLoading ? <Skeleton /> : ""}
                    />
                  );
                }
              })}

          <Column
            // body={actionBodyTemplate}
            rowEditor={true}
            exportable={false}
            style={{ minWidth: "12rem" }}
            body={isLoading ? <Skeleton /> : ""}
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
