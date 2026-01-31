export interface ChunkOptions {
    maxTokens: number;      // Target tokens per chunk (default: 500)
    overlapTokens: number;  // Overlap for context continuity (default: 50)
}

export interface PDFChunk {
    content: string;
    chunkIndex: number;
    pageNumber?: number;
    tokenCount: number;
}

// Polyfill Promise.withResolvers for older Node versions (required by pdfjs-dist)
if (typeof Promise.withResolvers === 'undefined') {
    // @ts-ignore
    Promise.withResolvers = function () {
        let resolve, reject;
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return { promise, resolve, reject };
    };
}

// Polyfill standard browser APIs
// These must be defined BEFORE importing pdfjs-dist
// @ts-ignore
if (typeof global.DOMMatrix === 'undefined') global.DOMMatrix = class DOMMatrix { };
// @ts-ignore
if (typeof global.ImageData === 'undefined') global.ImageData = class ImageData { };
// @ts-ignore
if (typeof global.Path2D === 'undefined') global.Path2D = class Path2D { };

/**
 * Extract text from PDF buffer using pdfjs-dist
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
    try {
        // Dynamically import pdfjs-dist (standard build for Node.js)
        const pdfjs = await import('pdfjs-dist/build/pdf.mjs');
        const path = await import('path');

        // Configure worker for Node.js environment
        // Point to the actual worker file in node_modules
        pdfjs.GlobalWorkerOptions.workerSrc = path.join(process.cwd(), 'node_modules/pdfjs-dist/build/pdf.worker.mjs');

        // Convert Buffer to Uint8Array

        // Convert Buffer to Uint8Array
        const uint8Array = new Uint8Array(pdfBuffer);

        // Load PDF document
        const loadingTask = pdfjs.getDocument({
            data: uint8Array,
            useSystemFonts: true,
            disableFontFace: true,
        });

        const doc = await loadingTask.promise;
        const numPages = doc.numPages;
        let fullText = '';

        // Iterate through all pages
        for (let i = 1; i <= numPages; i++) {
            const page = await doc.getPage(i);
            const textContent = await page.getTextContent();

            // Extract text items and join them
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');

            fullText += pageText + '\n\n';
        }

        return fullText;
    } catch (error) {
        console.error('Error extracting PDF text:', error);
        throw new Error('Failed to extract text from PDF');
    }
}

/**
 * Estimate token count (rough approximation: 1 token ≈ 4 characters)
 */
export function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

/**
 * Split text into chunks with overlap
 */
export function chunkText(
    text: string,
    options: ChunkOptions = { maxTokens: 500, overlapTokens: 50 }
): PDFChunk[] {
    const chunks: PDFChunk[] = [];
    const { maxTokens, overlapTokens } = options;

    // Convert tokens to characters (rough approximation)
    const maxChars = maxTokens * 4;
    const overlapChars = overlapTokens * 4;

    // Split by paragraphs first to maintain context
    const paragraphs = text.split(/\n\n+/);

    let currentChunk = '';
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
        const paragraphWithNewline = paragraph + '\n\n';

        // If adding this paragraph would exceed max size
        if (currentChunk.length + paragraphWithNewline.length > maxChars) {
            if (currentChunk.length > 0) {
                // Save current chunk
                chunks.push({
                    content: currentChunk.trim(),
                    chunkIndex: chunkIndex++,
                    tokenCount: estimateTokens(currentChunk),
                });

                // Start new chunk with overlap from previous chunk
                const overlapText = currentChunk.slice(-overlapChars);
                currentChunk = overlapText + paragraphWithNewline;
            } else {
                // Single paragraph is too large, split by sentences
                const sentences = paragraph.split(/[.!?]+\s+/);
                for (const sentence of sentences) {
                    const sentenceWithSpace = sentence + '. ';

                    if (currentChunk.length + sentenceWithSpace.length > maxChars) {
                        if (currentChunk.length > 0) {
                            chunks.push({
                                content: currentChunk.trim(),
                                chunkIndex: chunkIndex++,
                                tokenCount: estimateTokens(currentChunk),
                            });
                            currentChunk = sentenceWithSpace;
                        } else {
                            // Even single sentence is too large, just add it
                            chunks.push({
                                content: sentenceWithSpace.trim(),
                                chunkIndex: chunkIndex++,
                                tokenCount: estimateTokens(sentenceWithSpace),
                            });
                            currentChunk = '';
                        }
                    } else {
                        currentChunk += sentenceWithSpace;
                    }
                }
            }
        } else {
            currentChunk += paragraphWithNewline;
        }
    }

    // Add remaining chunk
    if (currentChunk.trim().length > 0) {
        chunks.push({
            content: currentChunk.trim(),
            chunkIndex: chunkIndex,
            tokenCount: estimateTokens(currentChunk),
        });
    }

    return chunks;
}

/**
 * Process PDF and return chunks ready for database storage
 */
export async function processPDFToChunks(
    pdfBuffer: Buffer,
    options?: ChunkOptions
): Promise<PDFChunk[]> {
    // Extract text
    const text = await extractTextFromPDF(pdfBuffer);

    // Split into chunks
    const chunks = chunkText(text, options);

    console.log(`📄 Processed PDF: ${chunks.length} chunks created`);
    console.log(`📊 Total tokens: ${chunks.reduce((sum, c) => sum + c.tokenCount, 0)}`);

    return chunks;
}
