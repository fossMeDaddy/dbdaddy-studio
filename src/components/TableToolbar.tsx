import { Button } from "primereact/button";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";

const TableHeader = ({
  table,
  globalFilterValue,
  onGlobalFilterChange,
  clearFilters,
}: {
  table: string;
  globalFilterValue: string;
  onGlobalFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearFilters: () => void;
}) => {
  return (
    <div className="flex justify-content-between">
      <Button
        type="button"
        icon="pi pi-filter-slash"
        label="Clear"
        outlined
        onClick={clearFilters}
      />
      <div>
        <h2 className="text-center text-3xl">{table}</h2>
      </div>
      <div className="p-input-icon-left">
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Keyword Search"
          />
        </IconField>
      </div>
    </div>
  );
};

export default TableHeader;
