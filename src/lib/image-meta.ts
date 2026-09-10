/**
 * Minimal image dimension reader — parses width/height straight out of the
 * file header for JPEG, PNG, GIF and WebP. No dependency, no decoding.
 *
 * Why: an audit of the live site (2026-09-09) found listing heroes that were
 * 540px wide being stretched across a full-bleed banner, plus one image that
 * was literally 2×1 pixels — a blank upload that nobody noticed because the
 * page still "worked". The upload route accepted all of them, since it only
 * checked file size and magic bytes. Catching this at upload time is the only
 * place a fix actually sticks; cleaning the database after the fact just means
 * doing it again next month.
 */

export type ImageSize = { width: number; height: number };

export function readImageSize(buf: Buffer): ImageSize | null {
  if (buf.length < 24) return null;

  // PNG: 8-byte signature, then IHDR chunk with width/height as big-endian u32.
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }

  // GIF: "GIF8", then logical screen width/height as little-endian u16.
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) {
    return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
  }

  // WebP: "RIFF" .... "WEBP" then one of three chunk layouts.
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    const chunk = buf.toString("ascii", 12, 16);
    if (chunk === "VP8 " && buf.length >= 30) {
      return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
    }
    if (chunk === "VP8L" && buf.length >= 25) {
      const bits = buf.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (chunk === "VP8X" && buf.length >= 30) {
      const w = buf[24] | (buf[25] << 8) | (buf[26] << 16);
      const h = buf[27] | (buf[28] << 8) | (buf[29] << 16);
      return { width: w + 1, height: h + 1 };
    }
    return null;
  }

  // JPEG: walk the segment chain to the Start-Of-Frame marker, which carries
  // the real dimensions. Skipping segments by their declared length is what
  // makes this safe on files with big EXIF/ICC blocks up front.
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buf.length) {
      if (buf[offset] !== 0xff) {
        offset++;
        continue;
      }
      const marker = buf[offset + 1];
      // Standalone markers with no payload.
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
        offset += 2;
        continue;
      }
      // SOF0-SOF15, excluding DHT (c4), JPG (c8) and DAC (cc).
      const isSOF = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
      if (isSOF) {
        return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
      }
      const segLength = buf.readUInt16BE(offset + 2);
      if (segLength < 2) return null;
      offset += 2 + segLength;
    }
  }

  return null;
}

/**
 * Smallest acceptable width per bucket. Property photos run edge-to-edge on
 * desktop, so they need the most pixels; broker headshots render small.
 */
export const MIN_WIDTH_BY_BUCKET: Record<string, number> = {
  "property-photos": 1200,
  "blog-images": 1000,
  "broker-photos": 500,
};
