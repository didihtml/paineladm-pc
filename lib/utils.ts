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

function buildAbsoluteUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  return baseUrl ? `${baseUrl}${path}` : path;
}

export function buildPublicCardUrl(id: string) {
  return buildAbsoluteUrl(`/card/${id}`);
}

export function buildStudentLoginUrl() {
  return buildAbsoluteUrl("/aluno/login");
}
