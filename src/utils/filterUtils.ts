import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTableFilterMeta } from "primereact/datatable";
import { DataObject } from "../model/types";
export interface ColumnType {
  Name: string;
  Default: string;
  Nullable: boolean;
  DataType: string;
}

export const initializeFilters = (
  data: DataObject,
  schemaData: ColumnType[]
): DataTableFilterMeta => {
  const columns = Object.keys(data);
  const initialFilters: DataTableFilterMeta = {};

  schemaData.forEach((col) => {
    if (col.DataType == "timestamp" || col.DataType == "timestamptz") {
      initialFilters[col.Name] = {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      };
    } else {
      initialFilters[col.Name] = {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      };
    }
  });

  return initialFilters;
};

export const onGlobalFilterChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  filters: DataTableFilterMeta,
  setFilters: React.Dispatch<React.SetStateAction<DataTableFilterMeta>>,
  setGlobalFilterValue: React.Dispatch<React.SetStateAction<string>>
) => {
  const value = e.target.value;
  let _filters = { ...filters };
  //@ts-ignore
  _filters["global"].value = value;
  setFilters(_filters);
  setGlobalFilterValue(value);
};

export const clearFilters = (
  filters: DataTableFilterMeta,
  setFilters: React.Dispatch<React.SetStateAction<DataTableFilterMeta>>,
  setGlobalFilterValue: React.Dispatch<React.SetStateAction<string>>
) => {
  let _filters = { ...filters };
  //@ts-ignore
  _filters["global"].value = "";
  setFilters(_filters);
  setGlobalFilterValue("");
};
