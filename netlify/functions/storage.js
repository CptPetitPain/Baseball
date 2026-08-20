import { getStore } from "@netlify/blobs";

function getBlobStore() {
  const siteID = process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
  const token = process.env.BLOBS_TOKEN;
  if (siteID && token) {
    return getStore({ name: "dragons-app", siteID, token });
  }
  // Fallback: relies on automatic context injection (works on some setups,
  // but not all — hence the manual siteID/token path above).
  return getStore("dragons-app");
}

export async function handler(event) {
  const store = getBlobStore();

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
}
