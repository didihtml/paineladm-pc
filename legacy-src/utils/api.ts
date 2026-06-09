function normalizeBaseUrl(value: string) {
  return value.replace(/\/$/, "");
}

function getConfiguredBaseUrl() {
  const envValue = import.meta.env.VITE_API_BASE_URL;
  return envValue ? normalizeBaseUrl(envValue) : "";
}

export function buildApiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const baseUrl = getConfiguredBaseUrl();
  return baseUrl ? `${baseUrl}${path}` : path;
}

export function buildAssetUrl(path: string) {
  return buildApiUrl(path);
}

export async function apiFetch(path: string, init?: RequestInit) {
  const response = await fetch(buildApiUrl(path), {
    credentials: "include",
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
  });

  return response;
}
