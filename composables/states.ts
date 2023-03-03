import type { Alert } from "@/types";

export const useAlerts = () => useState<Alert[]>("alerts", () => []);
