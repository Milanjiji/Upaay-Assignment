export const fetcher = async (url: string) => {
  const cookies = typeof document !== "undefined" ? document.cookie.split(";") : [];
  const tokenCookie = cookies.find(c => c.trim().startsWith("token="));
  const tokenVal = tokenCookie ? tokenCookie.split("=")[1] : "";

  const headers: Record<string, string> = {};
  if (tokenVal) {
    headers["x-user-id"] = tokenVal;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error("Failed to fetch API data");
  }
  return res.json();
};
