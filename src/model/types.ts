export interface DataItem {
  DataType: string;
  StrValue: string;
}

export interface DataObject {
  [key: string]: DataItem[];
}
