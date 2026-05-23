import { dataModeSchema, type DataMode } from "@ai-omni/shared";

export const dataMode: DataMode = dataModeSchema.catch("mock").parse(process.env.NEXT_PUBLIC_DATA_MODE);

export function isApiMode() {
  return dataMode === "api";
}

export function isMockMode() {
  return dataMode === "mock";
}

export function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
}

export function getApiTenantId() {
  return process.env.NEXT_PUBLIC_TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
}
