/**
 * Service for interacting with the Bible API
 */

export interface Bible {
  id: string;
  dblId: string;
  abbreviation: string;
  abbreviationLocal: string;
  name: string;
  nameLocal: string;
  description: string;
  descriptionLocal: string;
  language: {
    id: string;
    name: string;
    nameLocal: string;
    script: string;
    scriptDirection: string;
  };
}

export interface Book {
  id: string;
  bibleId: string;
  abbreviation: string;
  name: string;
  nameLong: string;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  bibleId: string;
  number: string;
  bookId: string;
  reference: string;
}

export interface Verse {
  id: string;
  orgId: string;
  bibleId: string;
  bookId: string;
  chapterId: string;
  content: string;
  reference: string;
  verseCount: number;
  copyright: string;
  next?: {
    id: string;
    bookId: string;
  };
  previous?: {
    id: string;
    bookId: string;
  };
}

// List of Baptist-preferred English Bible versions
const BAPTIST_PREFERRED_ENGLISH_VERSIONS = [
  'KJV', // King James Version
  'NKJV', // New King James Version
  'ESV', // English Standard Version
  'NIV', // New International Version
  'CSB', // Christian Standard Bible (formerly HCSB, popular in Baptist circles)
  'NLT', // New Living Translation
  'NASB', // New American Standard Bible
  'NRSV', // New Revised Standard Version
  'ASV', // American Standard Version
  'GNT', // Good News Translation
  'NET', // New English Translation
];

/**
 * Filter Bible versions to prioritize Baptist-friendly translations
 * while still allowing access to other languages
 */
function filterBaptistFriendlyBibles(bibles: Bible[]): Bible[] {
  // Separate English versions from other languages
  const englishBibles = bibles.filter(bible => 
    bible.language.name.toLowerCase() === 'english'
  );
  
  const nonEnglishBibles = bibles.filter(bible => 
    bible.language.name.toLowerCase() !== 'english'
  );
  
  // Filter English bibles to preferred versions based on abbreviation
  const preferredEnglishBibles = englishBibles.filter(bible => 
    BAPTIST_PREFERRED_ENGLISH_VERSIONS.some(preferredAbbr => 
      bible.abbreviation.includes(preferredAbbr) || 
      bible.name.includes(preferredAbbr)
    )
  );
  
  // Return the filtered English bibles followed by all other language bibles
  return [...preferredEnglishBibles, ...nonEnglishBibles];
}

/**
 * Fetch all available Bibles
 */
export async function getBibles(): Promise<Bible[]> {
  try {
    const response = await fetch('/api/bible?action=getBibles');
    
    if (!response.ok) {
      throw new Error(`Error fetching Bibles: ${response.status}`);
    }
    
    const allBibles = await response.json();
    return filterBaptistFriendlyBibles(allBibles);
  } catch (error) {
    console.error('Failed to fetch Bibles:', error);
    throw error;
  }
}

/**
 * Fetch books for a specific Bible version
 */
export async function getBooks(bibleId: string): Promise<Book[]> {
  try {
    const response = await fetch(`/api/bible?action=getBooks&bibleId=${bibleId}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching Books: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch Books for Bible ${bibleId}:`, error);
    throw error;
  }
}

/**
 * Fetch chapters for a specific book
 */
export async function getChapters(bibleId: string, bookId: string): Promise<Chapter[]> {
  try {
    const response = await fetch(`/api/bible?action=getChapters&bibleId=${bibleId}&bookId=${bookId}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching Chapters: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch Chapters for Book ${bookId}:`, error);
    throw error;
  }
}

/**
 * Fetch a specific chapter content with verses
 */
export async function getChapterContent(
  bibleId: string,
  chapterId: string
): Promise<Verse> {
  try {
    const response = await fetch(
      `/api/bible?action=getChapterContent&bibleId=${bibleId}&chapterId=${chapterId}`
    );
    
    if (!response.ok) {
      throw new Error(`Error fetching Chapter content: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch Chapter content for ${chapterId}:`, error);
    throw error;
  }
}

/**
 * Search the Bible for a specific query
 */
export async function searchBible(
  bibleId: string,
  query: string
): Promise<{ query: string; verses: any[] }> {
  try {
    const response = await fetch(
      `/api/bible?action=search&bibleId=${bibleId}&query=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) {
      throw new Error(`Error searching Bible: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to search Bible ${bibleId} for "${query}":`, error);
    throw error;
  }
}