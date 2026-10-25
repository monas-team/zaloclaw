import { describe, it, expect } from "vitest";
import { probeImageDimensions } from "../src/compat/image-metadata.js";

// Minimal hand-built headers. Only the bytes the probe reads need to be right.
function png(w: number, h: number): Buffer {
  const b = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0);
  b.writeUInt32BE(13, 8);
  b.write("IHDR", 12, "latin1");
  b.writeUInt32BE(w, 16);
  b.writeUInt32BE(h, 20);
  return b;
}

function gif(w: number, h: number): Buffer {
  const b = Buffer.alloc(16);
  b.write("GIF89a", 0, "latin1");
  b.writeUInt16LE(w, 6);
  b.writeUInt16LE(h, 8);
  return b;
}

function bmp(w: number, h: number): Buffer {
  const b = Buffer.alloc(30);
  b.write("BM", 0, "latin1");
  b.writeInt32LE(w, 18);
  b.writeInt32LE(-h, 22); // top-down bitmap uses negative height
  return b;
}

function jpeg(w: number, h: number): Buffer {
  // SOI, APP0 (len 16), SOF0 (len 17) with dims, then SOS
  const parts: number[] = [0xff, 0xd8];
  parts.push(0xff, 0xe0, 0x00, 0x10, ...Array(14).fill(0)); // APP0 len 16
  parts.push(0xff, 0xc0, 0x00, 0x11, 0x08, (h >> 8) & 0xff, h & 0xff, (w >> 8) & 0xff, w & 0xff, 0x03, ...Array(9).fill(0));
  parts.push(0xff, 0xda, 0x00, 0x02);
  return Buffer.from(parts);
}

function webpVp8(w: number, h: number): Buffer {
  const b = Buffer.alloc(32);
  b.write("RIFF", 0, "latin1");
  b.write("WEBP", 8, "latin1");
  b.write("VP8 ", 12, "latin1");
  b[23] = 0x9d; b[24] = 0x01; b[25] = 0x2a;
  b.writeUInt16LE(w, 26);
  b.writeUInt16LE(h, 28);
  return b;
}

function webpVp8x(w: number, h: number): Buffer {
  const b = Buffer.alloc(32);
  b.write("RIFF", 0, "latin1");
  b.write("WEBP", 8, "latin1");
  b.write("VP8X", 12, "latin1");
  b.writeUIntLE(w - 1, 24, 3);
  b.writeUIntLE(h - 1, 27, 3);
  return b;
}

describe("probeImageDimensions (sharp replacement)", () => {
  it("reads PNG", () => expect(probeImageDimensions(png(640, 480))).toEqual({ width: 640, height: 480 }));
  it("reads GIF", () => expect(probeImageDimensions(gif(320, 200))).toEqual({ width: 320, height: 200 }));
  it("reads BMP (top-down negative height)", () =>
    expect(probeImageDimensions(bmp(100, 50))).toEqual({ width: 100, height: 50 }));
  it("reads JPEG via SOF0 scan", () => expect(probeImageDimensions(jpeg(1920, 1080))).toEqual({ width: 1920, height: 1080 }));
  it("reads WebP VP8", () => expect(probeImageDimensions(webpVp8(800, 600))).toEqual({ width: 800, height: 600 }));
  it("reads WebP VP8X", () => expect(probeImageDimensions(webpVp8x(1024, 768))).toEqual({ width: 1024, height: 768 }));
  it("returns null for non-image data", () => {
    expect(probeImageDimensions(Buffer.from("%PDF-1.7 hello world this is not an image"))).toBeNull();
    expect(probeImageDimensions(Buffer.from("<!doctype html><html></html>"))).toBeNull();
    expect(probeImageDimensions(Buffer.alloc(0))).toBeNull();
  });
  it("does not throw on truncated headers", () => {
    expect(probeImageDimensions(png(1, 1).subarray(0, 16))).toBeNull();
    expect(probeImageDimensions(Buffer.from([0xff, 0xd8, 0xff]))).toBeNull();
  });
});
