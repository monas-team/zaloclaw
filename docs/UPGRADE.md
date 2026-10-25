# Install, upgrade and rollback

Applies to ZaloClaw 2.6.x on OpenClaw 2026.10.7. Check `docs/COMPAT.md`
for the exact verified pair before doing anything on a production account.

Zalo personal-account access goes through an unofficial API (zca-js). Always
canary on a **secondary** Zalo account first; a protocol change can lock an
account with no warning.

## Fresh install

```bash
git clone <repo> ~/.openclaw/zaloclaw
cd ~/.openclaw/zaloclaw
npm ci
npm install --no-save openclaw@2026.10.7      # or link the globally installed one
node scripts/compat-check.mjs                  # must print RESULT: PASS
npm run build

openclaw plugins install --link --force --no-enable ~/.openclaw/zaloclaw
openclaw config set plugins.entries.zaloclaw.enabled true
openclaw config set channels.zaloclaw '{"enabled":true,"dmPolicy":"allowlist","allowFrom":[],"groupPolicy":"disabled"}' --json
systemctl --user restart openclaw-gateway
openclaw channels status                       # expect: ZaloClaw ... not logged in
openclaw channels login --channel zaloclaw     # scan QR with the TEST account
```

Open `dmPolicy` / `groupPolicy` only after the live checklist passes.

## Upgrade from 2.5.x

1. Stop the channel so no message is half-processed:
   ```bash
   openclaw config set channels.zaloclaw.enabled false
   ```
2. Back up and migrate config (dry run first, then apply). The script copies
   `openclaw.json` and `zaloclaw-credentials.json` to
   `~/.openclaw/.zaloclaw-migration-backup/<timestamp>/`, validates the channel
   config against the schema, and refuses to write if validation fails. It
   never modifies the credentials file.
   ```bash
   cd ~/.openclaw/zaloclaw
   node scripts/migrate-config.mjs
   node scripts/migrate-config.mjs --apply
   ```
3. Build and gate:
   ```bash
   npm ci && node scripts/compat-check.mjs && npm run build
   ```
4. Re-enable and restart:
   ```bash
   openclaw config set channels.zaloclaw.enabled true
   systemctl --user restart openclaw-gateway
   openclaw channels status
   ```
   Expected: the gateway log line `http server listening (N plugins: ... zaloclaw ...)`
   and `ZaloClaw default: enabled, configured, running`. The 2.5.x session file
   format is unchanged, so no re-login should be required. If the status says
   `not logged in`, the stored cookie was already expired; log in again.
5. Run the live checklist in `docs/COMPAT.md` on the canary account and
   record results there before touching the production account.

## Rollback

Config and session:
```bash
node scripts/migrate-config.mjs --rollback ~/.openclaw/.zaloclaw-migration-backup/<timestamp>
```

Plugin code (git):
```bash
cd ~/.openclaw/zaloclaw
git checkout v2.5.11-baseline      # or the previous release tag
npm ci && npm run build
systemctl --user restart openclaw-gateway
```
Note: 2.5.11 does **not** load on OpenClaw 2026.10.x (removed SDK subpaths,
sharp native addon). A code rollback only makes sense together with an
OpenClaw downgrade to 2026.5.x. Prefer rolling back to the previous 2.6.x tag.

## Secrets

- The only secret store is `~/.openclaw/zaloclaw-credentials.json` (mode 0600).
  It is git-ignored along with `*credentials*.json`, `*.sqlite*`, `qr-*.png`.
- Never paste that file, cookies, IMEI or phone numbers into issues or PRs.
- CI has a secret-scan step that fails on credential-like tracked files.

## Auto-update policy

`.github/workflows/openclaw-update-check.yml` runs weekly. It detects a newer
OpenClaw stable, runs the compat gate against it, and opens a PR labelled
`needs-canary`. It never merges and never deploys. Merge only when the gate
is PASS **and** the live checklist passed on the canary account.
