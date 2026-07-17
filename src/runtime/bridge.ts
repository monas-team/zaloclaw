/**
 * ZaloClaw Bridge Service v1
 * Exposed on globalThis.__zaloclawBridgeService during register().
 * Allows sibling OpenClaw plugins to call ZaloClaw actions programmatically.
 */
import { executeZaloClawTool, ACTIONS } from "../tools/tool.js";

export type ZaloClawBridgeService = {
  readonly version: 1;
  getStatus(accountId?: string): { connected: boolean; accountId: string; channel: "zaloclaw" };
  listActions(accountId?: string): readonly string[];
  executeAction(accountId: string, params: { action: string; [key: string]: unknown }): Promise<unknown>;
};

declare global {
  // eslint-disable-next-line no-var
  var __zaloclawBridgeService: ZaloClawBridgeService | undefined;
}

export function exposeBridgeService(): void {
  const service: ZaloClawBridgeService = {
    version: 1,
    getStatus(accountId = "default") {
      return { connected: true, accountId, channel: "zaloclaw" };
    },
    listActions(_accountId?: string) {
      return ACTIONS;
    },
    async executeAction(accountId, params) {
      return executeZaloClawTool(accountId, params as any);
    },
  };
  globalThis.__zaloclawBridgeService = service;
}
