/**
 * Service for handling Strong's concordance functionality
 * For retrieving original Hebrew/Greek words and their definitions
 */

export interface StrongsEntry {
  strongsNumber: string;     // The Strong's reference number (e.g., H1234 or G5678)
  originalWord: string;      // Original Hebrew or Greek word
  transliteration: string;   // English transliteration
  definition: string;        // The definition/meaning of the word
  language: 'hebrew' | 'greek'; // The language of the original word
}

/**
 * Check if a book is in the Old Testament
 * @param bookId Book identifier (e.g., 'GEN', 'EXO', 'MAT')
 * @returns Boolean indicating if the book is in the Old Testament
 */
export function isOldTestament(bookId: string): boolean {
  // Old Testament books abbreviations
  const oldTestamentBooks = [
    'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA',
    '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO',
    'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO',
    'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL'
  ];
  
  return oldTestamentBooks.includes(bookId);
}

/**
 * Get language based on book (Old Testament = Hebrew, New Testament = Greek)
 * @param bookId Book identifier (e.g., 'GEN', 'EXO', 'MAT')
 * @returns Language ('hebrew' or 'greek')
 */
export function getLanguageForBook(bookId: string): 'hebrew' | 'greek' {
  return isOldTestament(bookId) ? 'hebrew' : 'greek';
}

/**
 * Extract book ID from chapter ID (e.g., "GEN.1" -> "GEN")
 * @param chapterId Chapter identifier 
 * @returns Book identifier
 */
export function getBookIdFromChapterId(chapterId: string): string {
  return chapterId.split('.')[0];
}

/**
 * Get Strong's concordance data for a word
 * @param word The English word to look up
 * @param language The language to search in ('hebrew' or 'greek')
 * @returns Promise with Strong's entry data or error
 */
export async function getStrongsData(
  word: string, 
  language: 'hebrew' | 'greek'
): Promise<StrongsEntry | null> {
  try {
    // Skip common words that won't have Strong's data to avoid unnecessary API calls
    const commonWords = ['the', 'a', 'an', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'with'];
    if (commonWords.includes(word.toLowerCase())) {
      return null;
    }
    
    const requestUrl = `/api/strongs?word=${encodeURIComponent(word)}&language=${language}`;
    const response = await fetch(requestUrl);
    
    if (!response.ok) {
      if (response.status === 404) {
        // Word not found in Strong's database
        return null;
      }
      throw new Error(`Error fetching Strong's data: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch Strong's data:`, error);
    throw error;
  }
}

/**
 * Get Strong's data based on Strong's number directly
 * @param strongsNumber The Strong's reference number (e.g., "H1234" or "G5678")
 * @returns Promise with Strong's entry data or error
 */
export async function getStrongsDataByNumber(strongsNumber: string): Promise<StrongsEntry | null> {
  try {
    const response = await fetch(`/api/strongs?number=${encodeURIComponent(strongsNumber)}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        // Strong's number not found
        return null;
      }
      throw new Error(`Error fetching Strong's data: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch Strong's data:`, error);
    throw error;
  }
}