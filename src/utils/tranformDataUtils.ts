import { DataObject } from "../model/types";

export const transformData = (data: DataObject): Record<string, string>[] => {
  const result: Record<string, string>[] = [];
  const columns = Object.keys(data);
  const itemCount = data[columns[0]].length;

  for (let i = 0; i < itemCount; i++) {
    const row: Record<string, string> = {};
    columns.forEach((column) => {
      row[column] = data[column][i].StrValue;
    });
    result.push(row);
  }

  return result;
};
