import type { TabType } from "@/types/chat";

export type PesanTabParam = "customers" | "doctors";

export function tabTypeToParam(tab: TabType): PesanTabParam {
  return tab === "Customers" ? "customers" : "doctors";
}

export function paramToTabType(param: string | null | undefined): TabType {
  if (param === "doctors") return "Doctors";
  return "Customers";
}

export function buildPesanUrl(options?: {
  threadId?: string | null;
  tab?: TabType;
}): string {
  const params = new URLSearchParams();
  if (options?.tab) {
    params.set("tab", tabTypeToParam(options.tab));
  }
  if (options?.threadId) {
    params.set("thread", options.threadId);
  }
  const query = params.toString();
  return query ? `/klinik/pesan?${query}` : "/klinik/pesan";
}

export function parsePesanParams(searchParams: URLSearchParams) {
  return {
    threadId: searchParams.get("thread"),
    tab: paramToTabType(searchParams.get("tab")),
  };
}

/** @deprecated Use buildPesanUrl({ threadId, tab: "Customers" }) */
export function customerChatUrl(threadId: string): string {
  return buildPesanUrl({ threadId, tab: "Customers" });
}

export function doctorChatUrl(threadId: string): string {
  return buildPesanUrl({ threadId, tab: "Doctors" });
}
