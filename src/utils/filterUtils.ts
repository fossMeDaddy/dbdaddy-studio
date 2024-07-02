import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTableFilterMeta } from "primereact/datatable";
import { DataObject } from "../model/types";
export const initializeFilters = (data: DataObject): DataTableFilterMeta => {
  const columns = Object.keys(data);
  const initialFilters: DataTableFilterMeta = {};

  columns.forEach((col) => {
    initialFilters[col] = {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    };
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
