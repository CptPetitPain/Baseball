const BASE = "/.netlify/functions/api";

export async function callApi(payload) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    /* non-JSON response */
  }
  if (!res.ok) {
    throw new Error(data.error || "Erreur réseau.");
  }
  return data;
}
