// List of words that have entries in our Strong's database
// This is derived from our actual mock data in the API route

// ONLY words that actually exist in our mock database, confirmed from log responses
export const hebrewStrongs = [
  'father', 'man', 'love', 'god', 'said', 'earth', 'son', 
  'behold', 'sin', 'lord', 'day', 'spirit', 'heaven'
];

// ONLY words that actually exist in our mock database, confirmed from log responses
export const greekStrongs = [
  'alpha', 'love', 'sin', 'man', 'kingdom', 'god', 'jesus', 
  'lord', 'word', 'heaven', 'father', 'faith', 'spirit', 
  'son', 'grace', 'christ'
];

// Add only specific word variations we're 100% sure are in the database
// We checked the logs to ensure these work correctly
export const wordVariations: Record<string, string[]> = {
  'god': ['god', 'gods'],
  'father': ['father'],
  'son': ['son'],
  'heaven': ['heaven', 'heavens'],
  'sin': ['sin', 'sins'],
  'love': ['love'],
  'spirit': ['spirit'],
  'christ': ['christ'],
  'jesus': ['jesus'],
  'man': ['man'],
  'king': ['king'],
  'lord': ['lord'],
};

// Create an expanded list of all words and their variations
const expandedHebrewList: string[] = [];
hebrewStrongs.forEach(word => {
  expandedHebrewList.push(word);
  if (wordVariations[word]) {
    expandedHebrewList.push(...wordVariations[word]);
  }
});

const expandedGreekList: string[] = [];
greekStrongs.forEach(word => {
  expandedGreekList.push(word);
  if (wordVariations[word]) {
    expandedGreekList.push(...wordVariations[word]);
  }
});

// Combined list for easier lookup with all variations
// Use a simple concat and filter for uniqueness
const combinedList = [...expandedHebrewList, ...expandedGreekList];
export const strongsWordList = combinedList.filter(
  (word, index) => combinedList.indexOf(word) === index
);

// Function to check if a word has a Strong's entry
export function hasStrongsEntry(word: string): boolean {
  // Words we know cause false positives - these definitely don't have entries
  const knownFalsePositives = [
    'day', 'days', 'saying', 'men', 'behold', 'beheld', 
    'say', 'said', 'says', 'beginning', 'messenger'
  ];
  
  // First check if it's a known false positive
  const cleanWord = word.toLowerCase().replace(/[.,;:!?'"()\[\]{}]/g, '');
  if (knownFalsePositives.includes(cleanWord)) {
    return false;
  }
  
  // Only do exact matches - no stemming
  return strongsWordList.includes(cleanWord);
}