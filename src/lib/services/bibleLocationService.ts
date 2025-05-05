/**
 * Service for providing Biblical location data for maps
 * This service maps Biblical places to their geographical coordinates
 */

export interface BiblicalLocation {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  relevantBooks: string[];  // Bible book identifiers this location appears in
  type: LocationType;
  importance: number;      // 1-10 scale of importance
}

export enum LocationType {
  CITY = 'city',
  REGION = 'region',
  COUNTRY = 'country',
  LANDMARK = 'landmark',
  WATER = 'water',
  MOUNTAIN = 'mountain',
  OTHER = 'other'
}

// Map of book IDs to their common name
export const BOOK_NAME_MAP: Record<string, string> = {
  'GEN': 'Genesis',
  'EXO': 'Exodus',
  'LEV': 'Leviticus',
  'NUM': 'Numbers',
  'DEU': 'Deuteronomy',
  'JOS': 'Joshua',
  'JDG': 'Judges',
  'RUT': 'Ruth',
  '1SA': '1 Samuel',
  '2SA': '2 Samuel',
  '1KI': '1 Kings',
  '2KI': '2 Kings',
  '1CH': '1 Chronicles',
  '2CH': '2 Chronicles',
  'EZR': 'Ezra',
  'NEH': 'Nehemiah',
  'EST': 'Esther',
  'JOB': 'Job',
  'PSA': 'Psalms',
  'PRO': 'Proverbs',
  'ECC': 'Ecclesiastes',
  'SNG': 'Song of Solomon',
  'ISA': 'Isaiah',
  'JER': 'Jeremiah',
  'LAM': 'Lamentations',
  'EZK': 'Ezekiel',
  'DAN': 'Daniel',
  'HOS': 'Hosea',
  'JOL': 'Joel',
  'AMO': 'Amos',
  'OBA': 'Obadiah',
  'JON': 'Jonah',
  'MIC': 'Micah',
  'NAM': 'Nahum',
  'HAB': 'Habakkuk',
  'ZEP': 'Zephaniah',
  'HAG': 'Haggai',
  'ZEC': 'Zechariah',
  'MAL': 'Malachi',
  'MAT': 'Matthew',
  'MRK': 'Mark',
  'LUK': 'Luke',
  'JHN': 'John',
  'ACT': 'Acts',
  'ROM': 'Romans',
  '1CO': '1 Corinthians',
  '2CO': '2 Corinthians',
  'GAL': 'Galatians',
  'EPH': 'Ephesians',
  'PHP': 'Philippians',
  'COL': 'Colossians',
  '1TH': '1 Thessalonians',
  '2TH': '2 Thessalonians',
  '1TI': '1 Timothy',
  '2TI': '2 Timothy',
  'TIT': 'Titus',
  'PHM': 'Philemon',
  'HEB': 'Hebrews',
  'JAS': 'James',
  '1PE': '1 Peter',
  '2PE': '2 Peter',
  '1JN': '1 John',
  '2JN': '2 John',
  '3JN': '3 John',
  'JUD': 'Jude',
  'REV': 'Revelation'
};

// Database of Biblical locations with their coordinates
// This is a curated set of major biblical locations
const BIBLICAL_LOCATIONS: BiblicalLocation[] = [
  {
    id: 'jerusalem',
    name: 'Jerusalem',
    description: 'The holy city and capital of ancient Israel',
    latitude: 31.7683,
    longitude: 35.2137,
    relevantBooks: ['1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'PSA', 'ISA', 'JER', 'MAT', 'MRK', 'LUK', 'JHN', 'ACT'],
    type: LocationType.CITY,
    importance: 10
  },
  {
    id: 'bethlehem',
    name: 'Bethlehem',
    description: 'Birthplace of Jesus and King David',
    latitude: 31.7054,
    longitude: 35.2024,
    relevantBooks: ['RUT', '1SA', 'MIC', 'MAT', 'LUK'],
    type: LocationType.CITY,
    importance: 9
  },
  {
    id: 'nazareth',
    name: 'Nazareth',
    description: 'Childhood home of Jesus',
    latitude: 32.7021,
    longitude: 35.3030,
    relevantBooks: ['MAT', 'MRK', 'LUK', 'JHN'],
    type: LocationType.CITY,
    importance: 8
  },
  {
    id: 'galilee',
    name: 'Sea of Galilee',
    description: 'Freshwater lake where Jesus performed many miracles',
    latitude: 32.8331,
    longitude: 35.5833,
    relevantBooks: ['MAT', 'MRK', 'LUK', 'JHN'],
    type: LocationType.WATER,
    importance: 8
  },
  {
    id: 'jericho',
    name: 'Jericho',
    description: 'Ancient city whose walls fell to Joshua\'s army',
    latitude: 31.8667,
    longitude: 35.4500,
    relevantBooks: ['JOS', 'LUK'],
    type: LocationType.CITY,
    importance: 7
  },
  {
    id: 'babylon',
    name: 'Babylon',
    description: 'Capital of the Babylonian Empire',
    latitude: 32.5429,
    longitude: 44.4212,
    relevantBooks: ['2KI', 'EZR', 'ISA', 'JER', 'DAN'],
    type: LocationType.CITY,
    importance: 9
  },
  {
    id: 'ur',
    name: 'Ur of the Chaldeans',
    description: 'Abraham\'s birthplace',
    latitude: 30.9627,
    longitude: 46.1031,
    relevantBooks: ['GEN'],
    type: LocationType.CITY,
    importance: 7
  },
  {
    id: 'egypt',
    name: 'Egypt',
    description: 'Ancient kingdom where Israelites were enslaved',
    latitude: 26.8206,
    longitude: 30.8025,
    relevantBooks: ['GEN', 'EXO', 'NUM', 'HOS', 'MAT'],
    type: LocationType.COUNTRY,
    importance: 9
  },
  {
    id: 'red_sea',
    name: 'Red Sea',
    description: 'Sea parted by Moses during the Exodus',
    latitude: 22.0000,
    longitude: 38.0000,
    relevantBooks: ['EXO'],
    type: LocationType.WATER,
    importance: 8
  },
  {
    id: 'mt_sinai',
    name: 'Mount Sinai',
    description: 'Where Moses received the Ten Commandments',
    latitude: 28.5400,
    longitude: 33.9700,
    relevantBooks: ['EXO', 'DEU'],
    type: LocationType.MOUNTAIN,
    importance: 9
  },
  {
    id: 'damascus',
    name: 'Damascus',
    description: 'Ancient city where Saul was converted',
    latitude: 33.5138,
    longitude: 36.2765,
    relevantBooks: ['ACT'],
    type: LocationType.CITY,
    importance: 7
  },
  {
    id: 'nineveh',
    name: 'Nineveh',
    description: 'Capital of Assyria where Jonah preached',
    latitude: 36.3600,
    longitude: 43.1600,
    relevantBooks: ['JON', 'NAM'],
    type: LocationType.CITY,
    importance: 7
  },
  {
    id: 'athens',
    name: 'Athens',
    description: 'Greek city where Paul preached at the Areopagus',
    latitude: 37.9838,
    longitude: 23.7275,
    relevantBooks: ['ACT'],
    type: LocationType.CITY,
    importance: 6
  },
  {
    id: 'corinth',
    name: 'Corinth',
    description: 'Greek city where Paul established a church',
    latitude: 37.9408,
    longitude: 22.9320,
    relevantBooks: ['ACT', '1CO', '2CO'],
    type: LocationType.CITY,
    importance: 7
  },
  {
    id: 'rome',
    name: 'Rome',
    description: 'Capital of the Roman Empire',
    latitude: 41.9028,
    longitude: 12.4964,
    relevantBooks: ['ACT', 'ROM'],
    type: LocationType.CITY,
    importance: 8
  },
  {
    id: 'ephesus',
    name: 'Ephesus',
    description: 'Ancient Greek city where Paul established a church',
    latitude: 37.9417,
    longitude: 27.3583,
    relevantBooks: ['ACT', 'EPH', 'REV'],
    type: LocationType.CITY,
    importance: 7
  },
  {
    id: 'philippi',
    name: 'Philippi',
    description: 'First city in Europe where Paul preached',
    latitude: 41.0135,
    longitude: 24.2859,
    relevantBooks: ['ACT', 'PHP'],
    type: LocationType.CITY,
    importance: 6
  },
  {
    id: 'dead_sea',
    name: 'Dead Sea',
    description: 'Salt lake bordered by Jordan and Israel',
    latitude: 31.5000,
    longitude: 35.5000,
    relevantBooks: ['GEN', 'JOS', 'EZK'],
    type: LocationType.WATER,
    importance: 7
  },
  {
    id: 'jordan_river',
    name: 'Jordan River',
    description: 'River where Jesus was baptized',
    latitude: 32.1667,
    longitude: 35.5833,
    relevantBooks: ['JOS', 'MAT', 'MRK', 'LUK', 'JHN'],
    type: LocationType.WATER,
    importance: 8
  },
  {
    id: 'bethany',
    name: 'Bethany',
    description: 'Village near Jerusalem, home of Mary, Martha, and Lazarus',
    latitude: 31.7739,
    longitude: 35.2583,
    relevantBooks: ['MAT', 'MRK', 'LUK', 'JHN'],
    type: LocationType.CITY,
    importance: 6
  },
  {
    id: 'capernaum',
    name: 'Capernaum',
    description: 'Town where Jesus made his base during his Galilean ministry',
    latitude: 32.8811,
    longitude: 35.5753,
    relevantBooks: ['MAT', 'MRK', 'LUK', 'JHN'],
    type: LocationType.CITY,
    importance: 7
  }
];

/**
 * Get locations relevant to a specific book of the Bible
 */
export function getLocationsByBook(bookId: string): BiblicalLocation[] {
  return BIBLICAL_LOCATIONS.filter(location => 
    location.relevantBooks.includes(bookId)
  ).sort((a, b) => b.importance - a.importance);
}

/**
 * Get the normalized book ID from a chapter ID
 * Chapter IDs from the API are in format like "GEN.1" for Genesis chapter 1
 */
export function getBookIdFromChapterId(chapterId: string): string | null {
  const parts = chapterId.split('.');
  return parts.length > 0 ? parts[0] : null;
}

/**
 * Get relevant locations for a specific chapter
 */
export function getLocationsByChapter(chapterId: string): BiblicalLocation[] {
  const bookId = getBookIdFromChapterId(chapterId);
  if (!bookId) return [];
  
  return getLocationsByBook(bookId);
}

/**
 * Get a specific location by ID
 */
export function getLocationById(locationId: string): BiblicalLocation | undefined {
  return BIBLICAL_LOCATIONS.find(location => location.id === locationId);
}

/**
 * Get all available Bible locations
 */
export function getAllLocations(): BiblicalLocation[] {
  return [...BIBLICAL_LOCATIONS];
}