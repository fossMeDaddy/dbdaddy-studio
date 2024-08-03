export const executeQuery = async (query: string) => {
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
      throw new Error("Failed to perform operation");
    }
    const responseData = await response.json();
    // const transformedData = transformData(responseData.Data);
    // setQueried(transformedData);
    // setShow(true);
    const data = responseData.Message;
    return data;
  } catch (error) {
    console.error("Error performing operation:", error);
    return null;
  }
};
