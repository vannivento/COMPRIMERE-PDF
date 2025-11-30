import { jsPDF } from "jspdf";
import * as pdfjsLib from "pdfjs-dist";

// Explicitly setting worker source for client-side rendering.
// Using the .mjs worker (ES Module) to ensure compatibility with the ESM import of pdfjs-dist.
// We use unpkg to dynamically match the version of the library being used.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;

interface CompressOptions {
  file: File;
  targetSizeMB: number;
  onProgress: (progress: number) => void;
}

export const compressPDF = async ({
  file,
  targetSizeMB,
  onProgress,
}: CompressOptions): Promise<{ blob: Blob; size: number }> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;

  // Calculate the byte budget per page based on user request
  const targetBytes = targetSizeMB * 1024 * 1024;
  
  // Overhead estimation for PDF structure (approx 2KB per page overhead + global overhead)
  const overheadBytes = 5000 + (totalPages * 2000); 
  const availableBytesForImages = Math.max(0, targetBytes - overheadBytes);
  const budgetPerPage = availableBytesForImages / totalPages;

  // Determine Quality and Scale settings based on the per-page budget
  // 1.0 scale at 72DPI A4 is approx 595x842 pixels (~0.5MP)
  // At Quality 0.6, a text/mixed page is roughly 50KB - 100KB.
  
  let scale = 1.0;
  let quality = 0.6;

  if (budgetPerPage > 300 * 1024) {
    // Generous budget (>300KB/page): Good quality
    scale = 1.2;
    quality = 0.8;
  } else if (budgetPerPage > 100 * 1024) {
    // Moderate budget (100KB-300KB/page): Standard quality
    scale = 1.0;
    quality = 0.6;
  } else if (budgetPerPage > 50 * 1024) {
    // Tight budget (50KB-100KB/page): Reduced resolution
    scale = 0.8;
    quality = 0.5;
  } else {
    // Very tight budget (<50KB/page): Aggressive compression
    // We must reduce resolution drastically to meet this target for visual content
    scale = 0.6;
    quality = 0.4;
  }

  // Sanity check: If user wants < 10KB per page, we floor the quality so it's not totally unreadable,
  // acknowledging we might miss the target size slightly.
  if (scale < 0.4) scale = 0.4;
  if (quality < 0.1) quality = 0.1;

  console.log(`Compression Plan: Target=${targetSizeMB}MB, Pages=${totalPages}, Budget/Page=${Math.round(budgetPerPage/1024)}KB -> Scale=${scale}, Quality=${quality}`);

  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  for (let i = 1; i <= totalPages; i++) {
    onProgress(Math.round(((i - 1) / totalPages) * 100));

    const page = await pdf.getPage(i);
    // Use the calculated scale directly. 
    // Previously we multiplied by 1.5 which caused file bloat.
    const viewport = page.getViewport({ scale: scale });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (!context) throw new Error("Canvas context not available");

    // Render transparent background as white
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    const imgData = canvas.toDataURL("image/jpeg", quality);

    // PDF Page dimensions (A4 is roughly 210 x 297 mm)
    const pdfPageWidth = 210;
    
    // Calculate dimensions to fit the PDF page width while maintaining aspect ratio
    const imgProps = doc.getImageProperties(imgData);
    const pdfHeight = (imgProps.height * pdfPageWidth) / imgProps.width;

    if (i > 1) {
      doc.addPage();
    }
    
    doc.addImage(imgData, "JPEG", 0, 0, pdfPageWidth, pdfHeight);
  }

  onProgress(100);
  const pdfOutput = doc.output("blob");

  return {
    blob: pdfOutput,
    size: pdfOutput.size,
  };
};

export const extractTextFromPDF = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  // Extract text from first 5 pages to avoid token limits and keep it fast
  const maxPages = Math.min(pdf.numPages, 5);

  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(" ");
    fullText += `Page ${i}: ${pageText}\n`;
  }

  return fullText;
};