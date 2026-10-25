/**
 * OpenClaw SDK compatibility layer.
 *
 * This is the ONLY place in ZaloClaw that is allowed to import SDK symbols
 * whose subpath moved between OpenClaw releases. Everything else imports
 * from here, so an OpenClaw upgrade that reshuffles `openclaw/plugin-sdk/*`
 * is a one-file change.
 *
 * Verified against: OpenClaw 2026.10.7 (see docs/COMPAT.md for the matrix).
 *
 * Mapping (ZaloClaw 2.5.11 → OpenClaw 2026.10.7):
 *   openclaw/plugin-sdk                        → openclaw/plugin-sdk/plugin-entry
 *     AnyAgentTool, OpenClawPluginApi, emptyPluginConfigSchema
 *   openclaw/plugin-sdk/config-runtime         → openclaw/plugin-sdk/config-contracts
 *     MarkdownTableMode                        (OpenClawConfig already lives in channel-core)
 *   openclaw/plugin-sdk/channel-reply-pipeline → openclaw/plugin-sdk/channel-outbound
 *     createReplyPrefixOptions, createTypingCallbacks
 *   openclaw/plugin-sdk/agent-config-primitives→ openclaw/plugin-sdk/channel-config-schema
 *     ToolPolicySchema
 */

export type { AnyAgentTool, OpenClawPluginApi } from "openclaw/plugin-sdk/plugin-entry";
export { emptyPluginConfigSchema } from "openclaw/plugin-sdk/plugin-entry";

export type { MarkdownTableMode } from "openclaw/plugin-sdk/config-contracts";
export type { OpenClawConfig } from "openclaw/plugin-sdk/channel-core";

export { createReplyPrefixOptions, createTypingCallbacks } from "openclaw/plugin-sdk/channel-outbound";

export { ToolPolicySchema } from "openclaw/plugin-sdk/channel-config-schema";
