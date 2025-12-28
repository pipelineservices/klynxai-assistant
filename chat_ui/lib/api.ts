const CORE_API =
  process.env.NEXT_PUBLIC_CORE_API || "http://127.0.0.1:9000";

export async function coreFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${CORE_API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Core API error: ${res.status} ${text}`);
  }

  return res.json();
}

