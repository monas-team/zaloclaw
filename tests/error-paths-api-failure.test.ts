/**
 * API-failure error paths, with the Zalo API client mocked.
 *
 * The real client is never constructed here, so these tests run
 * offline and never touch real credentials: getApi rejects, and
 * the send layer must surface that failure as { ok: false, error }
 * instead of throwing or reporting success.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/client/zalo-client.js", () => ({
  getApi: vi.fn(),
  getApiSync: () => null,
  getCurrentUid: () => null,
  isAuthenticated: () => false,
  hasStoredCredentials: () => false,
  loginWithQR: vi.fn(),
  loginWithCredentials: vi.fn(),
  logout: vi.fn(),
  ensureAuthenticated: vi.fn(),
}));

import { getApi } from "../src/client/zalo-client.js";
import { sendMessageZaloClaw } from "../src/channel/send.js";

const mockedGetApi = vi.mocked(getApi);

beforeEach(() => {
  mockedGetApi.mockRejectedValue(
    new Error("Zalo API unavailable (simulated login failure)"),
  );
});

describe("API failure surfaces as a send failure, not a throw", () => {
  it("text send returns ok:false with the API error", async () => {
    const result = await sendMessageZaloClaw("12345", "hello");
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Zalo API unavailable (simulated login failure)");
  });

  it("media send returns ok:false with the API error", async () => {
    const result = await sendMessageZaloClaw("12345", "caption", {
      mediaUrl: "https://example.com/photo.jpg",
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Zalo API unavailable (simulated login failure)");
  });

  it("a non-Error rejection is stringified, not swallowed", async () => {
    mockedGetApi.mockRejectedValue("boom");
    const result = await sendMessageZaloClaw("12345", "hello");
    expect(result).toEqual({ ok: false, error: "boom" });
  });
});
