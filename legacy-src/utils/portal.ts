import { buildApiUrl } from "@/utils/api";

export function buildPortalPath(codigoAcesso: string) {
  return `/portal/${encodeURIComponent(codigoAcesso)}`;
}

export function buildPortalUrl(codigoAcesso: string) {
  const path = buildPortalPath(codigoAcesso);
  return buildApiUrl(path);
}
