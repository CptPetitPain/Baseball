const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  const store = getStore("dragons-app");

  if (event.httpMethod === "GET") {
    const key = event.queryStringParameters && event.queryStringParameters.key;
    if (!key) return { statusCode: 400, body: "missing key" };
    const value = await store.get(key);
    if (value === null) {
      return { statusCode: 404, body: JSON.stringify({ error: "not_found" }) };
    }
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    };
  }

  if (event.httpMethod === "POST") {
    let payload;
    try {
      payload = JSON.parse(event.body || "{}");
    } catch (e) {
      return { statusCode: 400, body: "invalid JSON" };
    }
    const { key, value } = payload;
    if (!key) return { statusCode: 400, body: "missing key" };
    await store.set(key, value);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    };
  }

  return { statusCode: 405, body: "Method not allowed" };
};
