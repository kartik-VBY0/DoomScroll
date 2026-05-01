import { API_BASE_URL } from "./constants";

function resolveUrl(pathOrUrl) {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  return `${API_BASE_URL}${pathOrUrl}`;
}

export async function apiRequest(pathOrUrl, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const headers = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(resolveUrl(pathOrUrl), {
    ...options,
    headers,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.message || "API request failed";
    const apiError = new Error(message);
    apiError.status = response.status;
    throw apiError;
  }

  return payload;
}
