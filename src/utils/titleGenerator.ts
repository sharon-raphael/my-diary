/**
 * Generate a title from content
 * @param content - Entry content (may contain HTML or plain text)
 * @param maxLength - Maximum title length (default 50)
 * @returns Generated title
 */
export function generateTitle(content: string, maxLength: number = 50): string {
  // Strip HTML/formatting if present
  const plainText = content.replace(/<[^>]*>/g, '').trim();

  // Get first line
  const firstLine = plainText.split('\n')[0].trim();

  if (!firstLine) {
    return 'Untitled Entry';
  }

  // Truncate if too long
  if (firstLine.length > maxLength) {
    return firstLine.substring(0, maxLength) + '...';
  }

  return firstLine;
}
