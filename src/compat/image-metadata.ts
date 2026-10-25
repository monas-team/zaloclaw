/**
 * Pure-JS image dimension probe (no native addons).
 *
 * Why this exists:
 *   ZaloClaw <= 2.5.x used `sharp` only to read image width/height. OpenClaw
 *   >= 2026.10 stages plugin native addons (`*.node`) into a per-plugin
 *   "native admission" directory. sharp's prebuilt binary locates libvips via
 *   a relative RPATH (`$ORIGIN/../../node_modules/@img/...`) that no longer
 *   resolves from the staged layout, so the whole plugin failed to load with
 *   `ERR_DLOPEN_FAILED: libvips-cpp.so.42`. Reading a few header bytes is all
 *   we need, so we drop the native dependency entirely.
 *
 * Supported: PNG, JPEG, GIF, WebP (VP8 / VP8L / VP8X), BMP.
 * Returns null for anything else (callers treat null as "not an image").
 */
import * as fs from "node:fs";

export type ImageDimensions = { width: number; height: number };

const HEADER_BYTES = 64 * 1024; // enough for JPEG SOF scan in practice

export function probeImageDimensions(buf: Buffer): ImageDimensions | null {
  if (buf.length < 12) return null;

  // PNG: 8-byte signature, IHDR at offset 16 (width) / 20 (height)
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    if (buf.length < 24) return null;
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }

  // GIF: "GIF87a" / "GIF89a", logical screen size at offset 6/8 (LE)
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) {
    return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
  }

  // BMP: "BM", DIB header at 18/22 (LE, height may be negative = top-down)
  if (buf[0] === 0x42 && buf[1] === 0x4d) {
    if (buf.length < 26) return null;
    return { width: buf.readInt32LE(18), height: Math.abs(buf.readInt32LE(22)) };
  }

  // WebP: "RIFF....WEBP" then chunk VP8 / VP8L / VP8X
  if (buf.toString("latin1", 0, 4) === "RIFF" && buf.toString("latin1", 8, 12) === "WEBP") {
    if (buf.length < 30) return null;
    const chunk = buf.toString("latin1", 12, 16);
    if (chunk === "VP8 ") {
      // frame header at 20: 3 byte start code (9d 01 2a) then 14-bit w/h
      return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
    }
    if (chunk === "VP8L") {
      const b0 = buf[21], b1 = buf[22], b2 = buf[23], b3 = buf[24];
      const width = 1 + (((b1 & 0x3f) << 8) | b0);
      const height = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
      return { width, height };
    }
    if (chunk === "VP8X") {
      const width = 1 + buf.readUIntLE(24, 3);
      const height = 1 + buf.readUIntLE(27, 3);
      return { width, height };
    }
    return null;
  }

  // JPEG: scan markers for SOFn (C0..CF except C4, C8, CC)
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let off = 2;
    while (off + 9 < buf.length) {
      if (buf[off] !== 0xff) { off++; continue; }
      const marker = buf[off + 1];
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { off += 2; continue; }
      if (marker === 0xff) { off++; continue; }
      const len = buf.readUInt16BE(off + 2);
      const isSOF = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
      if (isSOF) {
        return { height: buf.readUInt16BE(off + 5), width: buf.readUInt16BE(off + 7) };
      }
      if (marker === 0xda) break; // start of scan, no SOF found
      off += 2 + len;
    }
    return null;
  }

  return null;
}

/** Read just the header of a file and probe it. Throws on I/O errors. */
export async function readImageDimensions(filePath: string): Promise<ImageDimensions | null> {
  const fh = await fs.promises.open(filePath, "r");
  try {
    const { size } = await fh.stat();
    const len = Math.min(size, HEADER_BYTES);
    const buf = Buffer.alloc(len);
    await fh.read(buf, 0, len, 0);
    return probeImageDimensions(buf);
  } finally {
    await fh.close();
  }
}
