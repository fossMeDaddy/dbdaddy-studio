import { DataObject } from "../model/types";

export const fetchTableData = async (
  schema: string,
  table: string,
  queryPart: string = ""
) => {
  let query = `select * from ${schema}.${table} `;
  if (queryPart.length != 0) {
    query = query + queryPart;
  }
  console.log(query);
  const requestOptions: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: query,
    }),
  };

  try {
    const response = await fetch("http://127.0.0.1:42069/exec", requestOptions);
    if (!response.ok) {
      throw new Error("Failed to get Data");
    }
    const responseData = await response.json();
    // const transformedData = transformData(responseData.Data);
    // setQueried(transformedData);
    // setShow(true);
    const data = responseData.Data;
    return data;
  } catch (error) {
    console.error("Error Fetching Data:", error);
    return null;
  }
};
