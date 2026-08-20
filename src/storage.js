const BASE = "/.netlify/functions/storage";

export async function getItem(key) {
  const res = await fetch(`${BASE}?key=${encodeURIComponent(key)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("storage get failed");
  return res.json(); // { key, value }
}

export async function setItem(key, value) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, value }),
  });
  if (!res.ok) throw new Error("storage set failed");
  return res.json();
}
