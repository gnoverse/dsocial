const METADATA_CHUNKS = ["ICCP", "EXIF", "XMP "];

// The flags in the first byte of the VP8X chunk which say that the metadata chunks are present.
const METADATA_FLAGS = 0x20 | 0x08 | 0x04;

const littleEndian = (n: number) => String.fromCharCode(n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >>> 24) & 0xff);

/**
 * Remove the metadata from a WebP image, encoded in base64. iOS adds a color profile which is bigger than
 * a small image itself. Return the image unchanged if it isn't a WebP.
 */
export function stripWebpMetadata(base64: string): string {
  const file = atob(base64);
  if (file.slice(0, 4) !== "RIFF" || file.slice(8, 12) !== "WEBP") return base64;

  let chunks = "";
  let position = 12;
  while (position + 8 <= file.length) {
    const name = file.slice(position, position + 4);
    const byte = (i: number) => file.charCodeAt(position + i);
    const size = byte(4) + byte(5) * 0x100 + byte(6) * 0x10000 + byte(7) * 0x1000000;
    // A chunk is padded to an even size.
    const end = position + 8 + size + (size % 2);
    if (end > file.length) return base64;

    if (name === "VP8X") {
      chunks += file.slice(position, position + 8) + String.fromCharCode(byte(8) & ~METADATA_FLAGS) + file.slice(position + 9, end);
    } else if (!METADATA_CHUNKS.includes(name)) {
      chunks += file.slice(position, end);
    }
    position = end;
  }

  return btoa("RIFF" + littleEndian(4 + chunks.length) + "WEBP" + chunks);
}
