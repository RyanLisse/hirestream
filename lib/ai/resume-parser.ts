/**
 * Resume Parser
 *
 * Extracts clean text from resume files (PDF and plain text)
 */

import { PDFParse } from 'pdf-parse'

export async function parseResume(file: Buffer, mimeType: string): Promise<string> {
  try {
    // Handle PDF files
    if (mimeType === 'application/pdf') {
      const pdfParser = new PDFParse()
      const data = await pdfParser.parseBuffer(file)
      return cleanText(data.text)
    }

    // Handle plain text files
    if (mimeType === 'text/plain') {
      const text = file.toString('utf-8')
      return cleanText(text)
    }

    throw new Error(`Unsupported file type: ${mimeType}. Only PDF and plain text files are supported.`)
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse resume: ${error.message}`)
    }
    throw new Error('Failed to parse resume: Unknown error')
  }
}

/**
 * Clean and normalize extracted text
 */
function cleanText(text: string): string {
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove special characters that might interfere with parsing
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize line breaks
    .replace(/\r\n/g, '\n')
    // Trim
    .trim()
}
