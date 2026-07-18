import zlib from "zlib";

function countPdfPages(buffer: Buffer): number | null {
  try {
    const text = buffer.toString("utf-8");

    const rootPages = text.match(/\/Type\s*\/Pages[\s\S]*?\/Count\s+(\d+)/);
    if (rootPages) {
      const count = parseInt(rootPages[1], 10);
      if (!isNaN(count) && count > 0) return count;
    }

    const pageObjects = text.match(/\/Type\s*\/Page\b/g);
    if (pageObjects && pageObjects.length > 0) {
      return pageObjects.length;
    }

    return null;
  } catch (err) {
    console.error("PDF PAGE COUNT ERROR:", err);
    return null;
  }
}

function countPptxSlides(buffer: Buffer): number {
  try {
    const text = buffer.toString("utf-8");
    const regex = /ppt\/slides\/slide(\d+)\.xml/g;
    const slides = new Set<number>();
    let match;
    while ((match = regex.exec(text)) !== null) {
      slides.add(parseInt(match[1], 10));
    }
    const count = slides.size;
    if (count > 0) return count;
    const altRegex = /ppt\/slides\/slide(\d+)\.xml/gi;
    const altSlides = new Set<number>();
    while ((match = altRegex.exec(text)) !== null) {
      altSlides.add(parseInt(match[1], 10));
    }
    return altSlides.size;
  } catch (err) {
    console.error("[PageCount] PPTX error:", err);
    return 0;
  }
}

function countPptSlides(buffer: Buffer): number {
  try {
    const text = buffer.toString("utf-8").substring(0, 10000);
    const slideCount = text.match(/Slide\s*\d+/gi);
    if (slideCount) {
      const nums = slideCount.map((s) => parseInt(s.replace(/\D/g, ""), 10)).filter((n) => !isNaN(n));
      if (nums.length > 0) return Math.max(...nums);
    }
  } catch {}
  return 0;
}

function inflateZipEntry(compressedData: Buffer, compressionMethod: number): Buffer | null {
  try {
    if (compressionMethod === 0) {
      return compressedData;
    }
    if (compressionMethod === 8) {
      return zlib.inflateRawSync(compressedData);
    }
    return null;
  } catch {
    return null;
  }
}

function extractFromZip(buffer: Buffer, targetPath: string): Buffer | null {
  try {
    let offset = 0;
    while (offset + 30 <= buffer.length) {
      const sig = buffer.readUInt32LE(offset);
      if (sig !== 0x04034b50) break;

      const compressionMethod = buffer.readUInt16LE(offset + 8);
      const compressedSize = buffer.readUInt32LE(offset + 18);
      const uncompressedSize = buffer.readUInt32LE(offset + 22);
      const fileNameLen = buffer.readUInt16LE(offset + 26);
      const extraLen = buffer.readUInt16LE(offset + 28);
      const fileName = buffer.toString("utf-8", offset + 30, offset + 30 + fileNameLen);
      const dataStart = offset + 30 + fileNameLen + extraLen;

      if (fileName === targetPath) {
        const compressedData = buffer.slice(dataStart, dataStart + compressedSize);
        return inflateZipEntry(compressedData, compressionMethod);
      }

      offset = dataStart + compressedSize;
    }
  } catch {}
  return null;
}

function countDocxPageBreaks(xml: string): number {
  let pageCount = 1;

  const lastRendered = xml.match(/<w:lastRenderedPageBreak[\s\/]/g);
  if (lastRendered) {
    pageCount += lastRendered.length;
  }

  const explicitBreaks = xml.match(/<w:br[^>]*w:type="page"[^>]*\/>/g);
  if (explicitBreaks) {
    pageCount += explicitBreaks.length;
  }

  const sectionBreaks = xml.match(/<w:sectPr[\s>]/g);
  if (sectionBreaks && sectionBreaks.length > 1) {
    pageCount += sectionBreaks.length - 1;
  }

  return pageCount;
}

function estimateDocPagesFromXml(xml: string): number {
  const paras = xml.match(/<w:p[\s>]/g);
  const paraCount = paras ? paras.length : 0;

  if (paraCount > 0) {
    return Math.max(1, Math.ceil(paraCount / 30));
  }

  return 0;
}

function countDocxPages(buffer: Buffer): { pages: number; pending: boolean } {
  const xml = extractFromZip(buffer, "word/document.xml");

  if (xml) {
    const xmlStr = xml.toString("utf-8");
    const pagesFromBreaks = countDocxPageBreaks(xmlStr);
    if (pagesFromBreaks > 1) {
      return { pages: pagesFromBreaks, pending: false };
    }

    const pagesFromParas = estimateDocPagesFromXml(xmlStr);
    if (pagesFromParas > 0) {
      return { pages: pagesFromParas, pending: false };
    }
  }

  const fallback = estimateDocBinaryPages(buffer);
  return { pages: fallback, pending: fallback <= 1 };
}

function estimateDocBinaryPages(buffer: Buffer): number {
  const sizeKB = buffer.length / 1024;
  if (sizeKB < 5) return 1;
  if (sizeKB < 20) return Math.max(1, Math.round(sizeKB / 8));
  if (sizeKB < 100) return Math.max(1, Math.round(sizeKB / 15));
  return Math.max(1, Math.round(sizeKB / 25));
}

function estimatePptBinaryPages(buffer: Buffer): number {
  try {
    const text = buffer.toString("utf-8").substring(0, 20000);
    const slideLabels = text.match(/(?:Slide|Page)\s*\d+/gi);
    if (slideLabels) {
      const nums = slideLabels.map((s) => parseInt(s.replace(/\D/g, ""), 10)).filter((n) => !isNaN(n));
      if (nums.length > 0) return Math.max(...nums);
    }
  } catch {}
  const sizeKB = buffer.length / 1024;
  return Math.max(1, Math.round(sizeKB / 30));
}

export async function extractPageCount(
  buffer: Buffer,
  ext: string
): Promise<{ pages: number; pending: boolean }> {
  const lowerExt = ext.toLowerCase();

  if (lowerExt === ".pdf") {
    const count = countPdfPages(buffer);
    if (count !== null && count > 0) {
      return { pages: count, pending: false };
    }
    console.error("PDF PAGE COUNT ERROR: could not extract page count from PDF buffer");
    return { pages: 1, pending: true };
  }

  if (lowerExt === ".pptx") {
    const slides = countPptxSlides(buffer);
    if (slides > 0) {
      return { pages: slides, pending: false };
    }
    return { pages: 1, pending: true };
  }

  if (lowerExt === ".ppt") {
    const slides = countPptSlides(buffer);
    if (slides > 0) {
      return { pages: slides, pending: false };
    }
    const estimated = estimatePptBinaryPages(buffer);
    return { pages: estimated, pending: estimated <= 1 };
  }

  if (lowerExt === ".docx") {
    return countDocxPages(buffer);
  }

  if (lowerExt === ".doc") {
    const estimated = estimateDocBinaryPages(buffer);
    return { pages: estimated, pending: estimated <= 1 };
  }

  return { pages: 1, pending: true };
}
