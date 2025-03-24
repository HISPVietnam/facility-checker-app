const baseUrl = import.meta.env.VITE_BASE_URL;
const username = import.meta.env.VITE_USERNAME;
const password = import.meta.env.VITE_PASSWORD;

const pull = async (endPoint) => {
  const result = await fetch(baseUrl + endPoint, {
    headers: {
      Authorization: !username ? "" : "Basic " + btoa(`${username}:${password}`)
    }
  });
  const json = await result.json();
  return json;
};

const push = async (endPoint, payload, method) => {
  const result = await fetch(baseUrl + endPoint, {
    method: method ? method : "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
      Authorization: !username ? "" : "Basic " + btoa(`${username}:${password}`)
    }
  });
  return result;
};

export { pull, push };
