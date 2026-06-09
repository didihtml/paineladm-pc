export interface ActionResult<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
  fieldErrors?: Record<string, string[]>;
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function toDateInputValue(date: Date | string) {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/$/, "");
}

function buildAbsoluteUrl(path: string, baseUrl?: string) {
  if (!baseUrl) {
    return path;
  }

  return `${normalizeBaseUrl(baseUrl)}${path}`;
}

function getPortalBaseUrl() {
  return process.env.NEXT_PUBLIC_PORTAL_URL ?? process.env.NEXT_PUBLIC_APP_URL;
}

function resolvePortalPath(
  template: string | undefined,
  fallbackPath: string,
  id?: string,
) {
  const path = template?.trim() || fallbackPath;

  if (!id) {
    return path;
  }

  return path.replaceAll("{id}", id).replaceAll(":id", id);
}

export function buildPublicCardUrl(id: string) {
  const path = resolvePortalPath(
    process.env.NEXT_PUBLIC_PORTAL_CARD_PATH,
    `/card/${id}`,
    id,
  );

  return buildAbsoluteUrl(path, getPortalBaseUrl());
}

export function buildStudentLoginUrl() {
  const path = resolvePortalPath(
    process.env.NEXT_PUBLIC_PORTAL_LOGIN_PATH,
    "/aluno/login",
  );

  return buildAbsoluteUrl(path, getPortalBaseUrl());
}
