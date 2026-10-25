# ZaloClaw ↔ OpenClaw compatibility

This file is the single source of truth for which OpenClaw versions this
plugin has been verified against. "PASS" in the automated matrix means the
gate in `scripts/compat-check.mjs` passed (SDK subpath exports, typecheck,
unit tests, build, import smoke, no native addons). It does **not** mean the
live Zalo send/receive path was exercised; that is tracked separately in
the "Live verification" section and must be done by a human on a test
account.

## Pinned target

| Field | Value |
|---|---|
| OpenClaw stable verified | 2026.10.7 |
| Plugin SDK min (`openclaw.compat.pluginApi`) | >=2026.10.7 |
| Gateway min (`openclaw.compat.minGatewayVersion`) | 2026.10.7 |
| zca-js | ^2.1.2 (2.2.0 available, not yet evaluated) |
| Node | >=22 (tested on 24) |

## API mapping: ZaloClaw 2.5.11 (OpenClaw 2026.5.7) → 2.6.x (OpenClaw 2026.10.7)

All relocated symbols are re-exported from `src/compat/openclaw-sdk.ts`; no
other file imports a moved subpath directly.

| Area | Old (2026.5.7) | New (2026.10.7) | Status |
|---|---|---|---|
| Plugin registration | `openclaw/plugin-sdk` → `OpenClawPluginApi`, `AnyAgentTool`, `emptyPluginConfigSchema` | `openclaw/plugin-sdk/plugin-entry` | subpath removed; re-exported via compat |
| Channel lifecycle | `openclaw/plugin-sdk/channel-plugin-common` → `ChannelPlugin`, `PluginRuntime`, account helpers | unchanged | OK |
| Channel contract types | `openclaw/plugin-sdk/channel-contract` | unchanged | OK |
| Config schema primitives | `openclaw/plugin-sdk/channel-config-primitives` | unchanged | OK |
| Tool policy schema | `openclaw/plugin-sdk/agent-config-primitives` → `ToolPolicySchema` | `openclaw/plugin-sdk/channel-config-schema` | subpath removed; re-exported via compat |
| Config runtime types | `openclaw/plugin-sdk/config-runtime` → `OpenClawConfig`, `MarkdownTableMode` | `channel-core` (OpenClawConfig), `config-contracts` (MarkdownTableMode) | subpath removed; re-exported via compat |
| Reply pipeline | `openclaw/plugin-sdk/channel-reply-pipeline` → `createReplyPrefixOptions`, `createTypingCallbacks` | `openclaw/plugin-sdk/channel-outbound` | subpath removed; re-exported via compat |
| Ack reactions | `AckReactionGateParams.requireMention` | field removed | dropped from call site |
| Command gating | `config.commands.useAccessGroups` | retired config path; core hardcodes `true` | mirrored (always `true`) |
| Feedback logging | `openclaw/plugin-sdk/channel-feedback` → `logTypingFailure`, `logAckFailure` | unchanged | OK |
| Allow-from helpers | `openclaw/plugin-sdk/allow-from` | unchanged | OK |
| Setup wizard | `openclaw/plugin-sdk/setup` → `WizardPrompter` | unchanged | OK |
| Runtime env | `openclaw/plugin-sdk/runtime` → `RuntimeEnv` | unchanged | OK |
| `PluginRuntime.channel.*` methods (21 used) | commands, text, session, routing, reply, reactions, pairing, logging | all present with same names | OK (verified by tsc probe) |
| Message payload / media / quote / mention | zca-js types, not OpenClaw | unchanged | OK |
| Native addons in plugins | loaded in place | staged into native admission dir; relative RPATH breaks | **sharp removed**, replaced by pure-JS header probe |
| Plugin trust | implicit | external channel plugin needs `plugins.entries.<id>.enabled=true` | handled by `scripts/migrate-config.mjs` |

### Deprecated / removed upstream (affecting this plugin)

- `openclaw/plugin-sdk` (bare) — removed
- `openclaw/plugin-sdk/agent-config-primitives` — removed
- `openclaw/plugin-sdk/channel-reply-pipeline` — removed
- `openclaw/plugin-sdk/config-runtime` — removed
- `commands.useAccessGroups` config key — retired (listed in core's retired-paths table)
- `AckReactionGateParams.requireMention` — removed
- `DirectDmCommandAuthorizationRuntime.resolveCommandAuthorizedFromAuthorizers` — marked `@deprecated`, still present. ZaloClaw still calls `core.channel.commands.resolveCommandAuthorizedFromAuthorizers`; migrate to `resolveChannelMessageIngress` (`openclaw/plugin-sdk/channel-ingress-runtime`) before it is dropped.

## Live verification (manual, test account)

| Case | Result | Date | Notes |
|---|---|---|---|
| Login via QR, session persisted | NOT RUN | | |
| Existing 2.5.x session file accepted after migration | NOT RUN | | credentials format unchanged; needs live confirm |
| Receive/send text DM | NOT RUN | | |
| Receive/send text group (mention gating) | NOT RUN | | |
| Reply/quote targets correct message | NOT RUN | | |
| Mention resolves correct UID | NOT RUN | | |
| Send/receive image | NOT RUN | | image dimension probe replaced sharp; verify tiny/banner filter still behaves |
| Send/receive file | NOT RUN | | |
| Long text, Unicode, emoji | NOT RUN | | |
| Reconnect after network loss | NOT RUN | | new backoff path |
| Reconnect after gateway restart | NOT RUN | | |
| Duplicate / out-of-order / broken media | NOT RUN | | |
| 24h soak | NOT RUN | | |


## Verified matrix

<!-- compat-matrix -->
| ZaloClaw | OpenClaw | Node | Result | Date | Notes |
|---|---|---|---|---|---|
| 2.6.0-compat.1 | 2026.10.7 | v24.22.1 | PASS | 2026-10-25 | automated gate |
