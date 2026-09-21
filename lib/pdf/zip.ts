/**
 * Client-Side Zero-Dependency ZIP Archive Generator
 * Implements standard PKZIP format with 'Store' method (uncompressed),
 * perfect for already-compressed formats like PNG and JPEG.
 */

export interface ZipFileEntry {
  name: string;
  data: Uint8Array;
}

// Precomputed CRC32 lookup table
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[n] = c >>> 0;
}

function computeCrc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    const byte = data[i]!;
    crc = CRC_TABLE[(crc ^ byte) & 0xff]! ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Creates a valid .zip file in memory from an array of file entries
 */
export function createZipArchive(files: ZipFileEntry[]): Uint8Array {
  const encoder = new TextEncoder();
  const localHeaders: Uint8Array[] = [];
  const centralDirHeaders: Uint8Array[] = [];

  let offset = 0;
  const now = new Date();
  // MS-DOS date and time
  const dosTime =
    ((now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2)) & 0xffff;
  const dosDate =
    (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xffff;

  for (const file of files) {
    const fileNameBytes = encoder.encode(file.name);
    const crc = computeCrc32(file.data);
    const size = file.data.byteLength;

    // --- Local File Header (30 bytes + filename) ---
    const localHeader = new Uint8Array(30 + fileNameBytes.length);
    const localView = new DataView(localHeader.buffer);

    localView.setUint32(0, 0x04034b50, true); // Local file header signature
    localView.setUint16(4, 20, true); // Version needed to extract (2.0)
    localView.setUint16(6, 0, true); // General purpose bit flag
    localView.setUint16(8, 0, true); // Compression method (0 = Stored)
    localView.setUint16(10, dosTime, true); // Last mod file time
    localView.setUint16(12, dosDate, true); // Last mod file date
    localView.setUint32(14, crc, true); // CRC-32
    localView.setUint32(18, size, true); // Compressed size
    localView.setUint32(22, size, true); // Uncompressed size
    localView.setUint16(26, fileNameBytes.length, true); // File name length
    localView.setUint16(28, 0, true); // Extra field length
    localHeader.set(fileNameBytes, 30);

    localHeaders.push(localHeader);
    localHeaders.push(file.data);

    // --- Central Directory Header (46 bytes + filename) ---
    const cdHeader = new Uint8Array(46 + fileNameBytes.length);
    const cdView = new DataView(cdHeader.buffer);

    cdView.setUint32(0, 0x02014b50, true); // Central file header signature
    cdView.setUint16(4, 20, true); // Version made by
    cdView.setUint16(6, 20, true); // Version needed to extract
    cdView.setUint16(8, 0, true); // General purpose bit flag
    cdView.setUint16(10, 0, true); // Compression method
    cdView.setUint16(12, dosTime, true); // Last mod file time
    cdView.setUint16(14, dosDate, true); // Last mod file date
    cdView.setUint32(16, crc, true); // CRC-32
    cdView.setUint32(20, size, true); // Compressed size
    cdView.setUint32(24, size, true); // Uncompressed size
    cdView.setUint16(28, fileNameBytes.length, true); // File name length
    cdView.setUint16(30, 0, true); // Extra field length
    cdView.setUint16(32, 0, true); // File comment length
    cdView.setUint16(34, 0, true); // Disk number start
    cdView.setUint16(36, 0, true); // Internal file attributes
    cdView.setUint32(38, 0, true); // External file attributes
    cdView.setUint32(42, offset, true); // Relative offset of local header
    cdHeader.set(fileNameBytes, 46);

    centralDirHeaders.push(cdHeader);

    offset += localHeader.length + file.data.length;
  }

  const centralDirOffset = offset;
  let centralDirSize = 0;
  for (const cdh of centralDirHeaders) {
    centralDirSize += cdh.length;
  }

  // --- End of Central Directory Record (22 bytes) ---
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);

  eocdView.setUint32(0, 0x06054b50, true); // EOCD signature
  eocdView.setUint16(4, 0, true); // Number of this disk
  eocdView.setUint16(6, 0, true); // Disk where central directory starts
  eocdView.setUint16(8, files.length, true); // Number of central directory records on this disk
  eocdView.setUint16(10, files.length, true); // Total number of central directory records
  eocdView.setUint32(12, centralDirSize, true); // Size of central directory
  eocdView.setUint32(16, centralDirOffset, true); // Offset of start of central directory
  eocdView.setUint16(20, 0, true); // Comment length

  // Assemble full archive
  const totalLength = offset + centralDirSize + eocd.length;
  const zipBuffer = new Uint8Array(totalLength);

  let currentPos = 0;
  for (const part of localHeaders) {
    zipBuffer.set(part, currentPos);
    currentPos += part.length;
  }
  for (const part of centralDirHeaders) {
    zipBuffer.set(part, currentPos);
    currentPos += part.length;
  }
  zipBuffer.set(eocd, currentPos);

  return zipBuffer;
}
