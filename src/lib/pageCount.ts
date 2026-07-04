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

function estimateDocPages(buffer: Buffer): number {
  try {
    const text = buffer.toString("utf-8");
    const paraRegex = /<w:p[ >]/g;
    const paras = text.match(paraRegex);
    if (paras && paras.length > 0) {
      return Math.max(1, Math.ceil(paras.length / 25));
    }
    const pageRegex = /<w:lastRenderedPageBreak[ >]|<w:pageBreakBefore[ >]/gi;
    const pageBreaks = text.match(pageRegex);
    if (pageBreaks && pageBreaks.length > 0) {
      return pageBreaks.length + 1;
    }
  } catch {}
  return 0;
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
    const docPages = estimateDocPages(buffer);
    if (docPages > 0) {
      return { pages: docPages, pending: false };
    }
    const sizeKB = buffer.length / 1024;
    const estimated = Math.max(1, Math.round(sizeKB / 12));
    return { pages: estimated, pending: true };
  }

  if (lowerExt === ".doc") {
    const estimated = estimateDocBinaryPages(buffer);
    return { pages: estimated, pending: estimated <= 1 };
  }

  return { pages: 1, pending: true };
}
