import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// API endpoint for the external Strong's concordance API
const STRONGS_API_URL = 'https://api.biblesupersearch.com/api'; // Example API - we'll need to replace with actual API

// Helper function to make requests to the Strong's API
async function makeStrongsApiRequest(endpoint: string, params: Record<string, string>) {
  try {
    // Convert params object to URL search params
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      searchParams.append(key, value);
    }
    
    const url = `${STRONGS_API_URL}${endpoint}?${searchParams.toString()}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Strong's API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error making Strong\'s API request:', error);
    throw error;
  }
}

// Mock data for development
const mockHebrewData = {
  'H1': {
    strongsNumber: 'H1',
    originalWord: 'אָב',
    transliteration: 'ʼâb',
    definition: 'Father, in a literal and immediate, or figurative and remote application',
    language: 'hebrew'
  },
  'H120': {
    strongsNumber: 'H120',
    originalWord: 'אָדָם',
    transliteration: 'ʼâdâm',
    definition: 'Man, mankind, human being. From a root meaning "to be red".',
    language: 'hebrew'
  },
  'H157': {
    strongsNumber: 'H157',
    originalWord: 'אָהַב',
    transliteration: 'ʼâhab',
    definition: 'To love, beloved, to have affection for, to like',
    language: 'hebrew'
  },
  'H430': {
    strongsNumber: 'H430',
    originalWord: 'אֱלֹהִים',
    transliteration: 'ĕlôhîym',
    definition: 'God, gods, judges, divine ones. The plural form of Eloah.',
    language: 'hebrew'
  },
  'H559': {
    strongsNumber: 'H559',
    originalWord: 'אָמַר',
    transliteration: 'ʼâmar',
    definition: 'To say, speak, utter, command, promise, intend',
    language: 'hebrew'
  },
  'H776': {
    strongsNumber: 'H776',
    originalWord: 'אֶרֶץ',
    transliteration: 'ʼerets',
    definition: 'Earth, land, ground, country, field, world',
    language: 'hebrew'
  },
  'H1121': {
    strongsNumber: 'H1121',
    originalWord: 'בֵּן',
    transliteration: 'bên',
    definition: 'Son, grandson, child, member of a group',
    language: 'hebrew'
  },
  'H1254': {
    strongsNumber: 'H1254',
    originalWord: 'בָּרָא',
    transliteration: 'bârâʼ',
    definition: 'To create, shape, form, to bring into being, to transform',
    language: 'hebrew'
  },
  'H1319': {
    strongsNumber: 'H1319',
    originalWord: 'בְּשׂוֹרָה',
    transliteration: 'besôrâh',
    definition: 'Good news, glad tidings, reward for good news',
    language: 'hebrew'
  },
  'H2009': {
    strongsNumber: 'H2009',
    originalWord: 'הִנֵּה',
    transliteration: 'hinnêh',
    definition: 'Behold, lo, see, look, there it is, observe',
    language: 'hebrew'
  },
  'H2403': {
    strongsNumber: 'H2403',
    originalWord: 'חַטָּאָה',
    transliteration: 'chaṭṭâʼâh',
    definition: 'Sin, sinful, sin offering, punishment for sin',
    language: 'hebrew'
  },
  'H2881': {
    strongsNumber: 'H2881',
    originalWord: 'טָבַל',
    transliteration: 'ṭâbal',
    definition: 'To dip, plunge, immerse, to be dipped',
    language: 'hebrew'
  },
  'H3063': {
    strongsNumber: 'H3063',
    originalWord: 'יְהוּדָה',
    transliteration: 'Yehûdâh',
    definition: 'Judah, praised; son of Jacob and the tribe descended from him',
    language: 'hebrew'
  },
  'H3068': {
    strongsNumber: 'H3068',
    originalWord: 'יְהֹוָה',
    transliteration: 'Yᵉhôvâh',
    definition: 'The proper name of the God of Israel, often rendered as "LORD"',
    language: 'hebrew'
  },
  'H3091': {
    strongsNumber: 'H3091',
    originalWord: 'יְהוֹשׁוּעַ',
    transliteration: 'Yehôshûaʻ',
    definition: 'Joshua or Jehoshua, "Jehovah is salvation"; the Hebrew name of Jesus',
    language: 'hebrew'
  },
  'H3110': {
    strongsNumber: 'H3110',
    originalWord: 'יוֹחָנָן',
    transliteration: 'Yôchânân',
    definition: 'Johanan, "Jehovah has graced"; the Hebrew name of John',
    language: 'hebrew'
  },
  'H3117': {
    strongsNumber: 'H3117',
    originalWord: 'יוֹם',
    transliteration: 'yôm',
    definition: 'Day, time, year; a period of time defined by an associated term',
    language: 'hebrew'
  },
  'H3383': {
    strongsNumber: 'H3383',
    originalWord: 'יַרְדֵּן',
    transliteration: 'Yardên',
    definition: 'Jordan, "descender"; the principal river of Palestine',
    language: 'hebrew'
  },
  'H3389': {
    strongsNumber: 'H3389',
    originalWord: 'יְרוּשָׁלַיִם',
    transliteration: 'Yerûshâlayim',
    definition: 'Jerusalem, "foundation of peace"; the capital city of Palestine',
    language: 'hebrew'
  },
  'H3478': {
    strongsNumber: 'H3478',
    originalWord: 'יִשְׂרָאֵל',
    transliteration: 'Yisrâʼêl',
    definition: 'Israel, "God prevails"; the name given to Jacob and his descendants',
    language: 'hebrew'
  },
  'H4057': {
    strongsNumber: 'H4057',
    originalWord: 'מִדְבָּר',
    transliteration: 'midbâr',
    definition: 'Wilderness, desert, uninhabited land, pasture',
    language: 'hebrew'
  },
  'H4325': {
    strongsNumber: 'H4325',
    originalWord: 'מַיִם',
    transliteration: 'mayim',
    definition: 'Water, waters, waterways, liquid; often used figuratively',
    language: 'hebrew'
  },
  'H4397': {
    strongsNumber: 'H4397',
    originalWord: 'מַלְאָךְ',
    transliteration: 'malʼâk',
    definition: 'Messenger, representative, angel, ambassador',
    language: 'hebrew'
  },
  'H4428': {
    strongsNumber: 'H4428',
    originalWord: 'מֶלֶךְ',
    transliteration: 'melek',
    definition: 'King, royal, ruler, chieftain, commander',
    language: 'hebrew'
  },
  'H4899': {
    strongsNumber: 'H4899',
    originalWord: 'מָשִׁיחַ',
    transliteration: 'mâshîyach',
    definition: 'Anointed, anointed one, Messiah, the Messiah',
    language: 'hebrew'
  },
  'H5030': {
    strongsNumber: 'H5030',
    originalWord: 'נָבִיא',
    transliteration: 'nâbîyʼ',
    definition: 'Prophet, inspired man, one who is divinely called',
    language: 'hebrew'
  },
  'H5162': {
    strongsNumber: 'H5162',
    originalWord: 'נָחַם',
    transliteration: 'nâcham',
    definition: 'To be sorry, repent, console oneself, regret, comfort',
    language: 'hebrew'
  },
  'H5971': {
    strongsNumber: 'H5971',
    originalWord: 'עַם',
    transliteration: 'ʻam',
    definition: 'People, nation, persons, members, kinsmen, troops',
    language: 'hebrew'
  },
  'H6963': {
    strongsNumber: 'H6963',
    originalWord: 'קוֹל',
    transliteration: 'qôl',
    definition: 'Voice, sound, noise, thunder; to proclaim',
    language: 'hebrew'
  },
  'H7225': {
    strongsNumber: 'H7225',
    originalWord: 'רֵאשִׁית',
    transliteration: 'rêshîyth',
    definition: 'Beginning, chief, first, principal thing',
    language: 'hebrew'
  },
  'H7307': {
    strongsNumber: 'H7307',
    originalWord: 'רוּחַ',
    transliteration: 'rûach',
    definition: 'Wind, breath, mind, spirit; the Spirit of God',
    language: 'hebrew'
  },
  'H8064': {
    strongsNumber: 'H8064',
    originalWord: 'שָׁמַיִם',
    transliteration: 'shâmayim',
    definition: 'Heaven, heavens, sky, visible heavens with stars, etc.',
    language: 'hebrew'
  },
};

const mockGreekData = {
  'G1': {
    strongsNumber: 'G1',
    originalWord: 'Α',
    transliteration: 'Alpha',
    definition: 'First letter of the Greek alphabet',
    language: 'greek'
  },
  'G26': {
    strongsNumber: 'G26',
    originalWord: 'ἀγάπη',
    transliteration: 'agapē',
    definition: 'Love, goodwill, benevolence; God\'s divine and unconditional love',
    language: 'greek'
  },
  'G266': {
    strongsNumber: 'G266',
    originalWord: 'ἁμαρτία',
    transliteration: 'hamartia',
    definition: 'Sin, missing the mark, offense, violation of divine law',
    language: 'greek'
  },
  'G444': {
    strongsNumber: 'G444',
    originalWord: 'ἄνθρωπος',
    transliteration: 'anthrōpos',
    definition: 'Man, human being, person, humanity in general',
    language: 'greek'
  },
  'G932': {
    strongsNumber: 'G932',
    originalWord: 'βασιλεία',
    transliteration: 'basileia',
    definition: 'Kingdom, sovereignty, royal power, dominion, rule',
    language: 'greek'
  },
  'G2316': {
    strongsNumber: 'G2316',
    originalWord: 'θεός',
    transliteration: 'theos',
    definition: 'God, a god, anything made an object of worship',
    language: 'greek'
  },
  'G2424': {
    strongsNumber: 'G2424',
    originalWord: 'Ἰησοῦς',
    transliteration: 'Iēsous',
    definition: 'Jesus, the Son of God, the Savior of mankind',
    language: 'greek'
  },
  'G2962': {
    strongsNumber: 'G2962',
    originalWord: 'κύριος',
    transliteration: 'kyrios',
    definition: 'Lord, master, owner; a title of honor, respect, and reverence',
    language: 'greek'
  },
  'G3056': {
    strongsNumber: 'G3056',
    originalWord: 'λόγος',
    transliteration: 'logos',
    definition: 'Word, speech, divine utterance, analogy, reason, account',
    language: 'greek'
  },
  'G3772': {
    strongsNumber: 'G3772',
    originalWord: 'οὐρανός',
    transliteration: 'ouranos',
    definition: 'Heaven, sky, air, the abode of God and angels',
    language: 'greek'
  },
  'G3962': {
    strongsNumber: 'G3962',
    originalWord: 'πατήρ',
    transliteration: 'patēr',
    definition: 'Father, parent, ancestor, elder, senior; used of God as the Father',
    language: 'greek'
  },
  'G4102': {
    strongsNumber: 'G4102',
    originalWord: 'πίστις',
    transliteration: 'pistis',
    definition: 'Faith, belief, trust, confidence, fidelity, faithfulness',
    language: 'greek'
  },
  'G4151': {
    strongsNumber: 'G4151',
    originalWord: 'πνεῦμα',
    transliteration: 'pneuma',
    definition: 'Spirit, wind, breath, the spiritual part of humanity; the Holy Spirit',
    language: 'greek'
  },
  'G5207': {
    strongsNumber: 'G5207',
    originalWord: 'υἱός',
    transliteration: 'huios',
    definition: 'Son, descendant, one of a certain character',
    language: 'greek'
  },
  'G5485': {
    strongsNumber: 'G5485',
    originalWord: 'χάρις',
    transliteration: 'charis',
    definition: 'Grace, favor, kindness, blessing, gratitude, thanks',
    language: 'greek'
  },
  'G5547': {
    strongsNumber: 'G5547',
    originalWord: 'Χριστός',
    transliteration: 'Christos',
    definition: 'Christ, Anointed One, Messiah; the title of Jesus',
    language: 'greek'
  },
};

// This is a simplified mock implementation - in production we would query an actual database or API
// that contains Strong's concordance data
function getMockStrongsData(word: string, language: string) {
  // Normalize the word
  const normalizedWord = word.toLowerCase().trim();
  
  // Example mappings (this would be much more extensive in a real implementation)
  const hebrewWordMap: Record<string, string> = {
    'god': 'H430',
    'father': 'H1',
    'beginning': 'H7225',
    'earth': 'H776',
    'heaven': 'H8064',
    'heavens': 'H8064',
    'said': 'H559',
    'man': 'H120',
    'lord': 'H3068',
    'king': 'H4428',
    'israel': 'H3478',
    'people': 'H5971',
    'son': 'H1121',
    'land': 'H776',
    'day': 'H3117',
    'water': 'H4325',
    'waters': 'H4325',
    'created': 'H1254',
    'spirit': 'H7307',
    'voice': 'H6963',
    'wilderness': 'H4057',
    'prophet': 'H5030',
    'behold': 'H2009',
    'messenger': 'H4397',
    'baptized': 'H2881',
    'john': 'H3110',
    'repentance': 'H5162',
    'sins': 'H2403',
    'jordan': 'H3383',
    'jesus': 'H3091',
    'christ': 'H4899',
    'gospel': 'H1319',
    'baptism': 'H2881',
    'judea': 'H3063',
    'jerusalem': 'H3389',
    'beloved': 'H157',
  };
  
  const greekWordMap: Record<string, string> = {
    'god': 'G2316',
    'word': 'G3056',
    'jesus': 'G2424',
    'christ': 'G5547',
    'lord': 'G2962',
    'faith': 'G4102',
    'love': 'G26',
    'spirit': 'G4151',
    'grace': 'G5485',
    'sin': 'G266',
    'sins': 'G266',
    'man': 'G444',
    'father': 'G3962',
    'son': 'G5207',
    'heaven': 'G3772',
    'heavens': 'G3772',
    'kingdom': 'G932',
    'gospel': 'G2098',
    'beginning': 'G746',
    'baptism': 'G908',
    'baptized': 'G907',
    'prophet': 'G4396',
    'repentance': 'G3341',
    'isaiah': 'G2268',
    'wilderness': 'G2048',
    'desert': 'G2048',
    'preached': 'G2784',
    'jordan': 'G2446',
    'judea': 'G2449',
    'jerusalem': 'G2419',
    'galilee': 'G1056',
    'voice': 'G5456',
    'messenger': 'G32',
    'baptize': 'G907',
    'holy': 'G40',
    'water': 'G5204',
    'dove': 'G4058',
    'beloved': 'G27',
    'pleased': 'G2106',
    'apostle': 'G652',
    'simon': 'G4613',
    'andrew': 'G406',
    'sea': 'G2281',
    'fishers': 'G231',
    'james': 'G2385',
    'johnname': 'G2491', // renamed to avoid duplicate
    'boat': 'G4143',
    'sabbath': 'G4521',
    'synagogue': 'G4864',
    'capernaum': 'G2584',
    'authority': 'G1849',
    'scribes': 'G1122',
    'unclean': 'G169',
    'destroy': 'G622',
    'nazarene': 'G3480',
    'commanded': 'G2004',
    'rebuked': 'G2008',
    'fever': 'G4446',
    'mother': 'G3384',
    'sick': 'G770',
  };
  
  // Mapping to handle word variants with the same meaning
  const normalizedToStandardWord: Record<string, string> = {
    'john': 'john',
    'johnname': 'john',
    'spirit': 'spirit',
    'holy': 'holy',
    'holyone': 'holy',
    'holyspirit': 'spirit',
    'father': 'father',
    'ourfather': 'father',
    'heavens': 'heaven',
    // Add more variants as needed
  };

  // Normalize to standard form if a variant exists
  const standardWord = normalizedToStandardWord[normalizedWord] || normalizedWord;
  
  // Select the appropriate map based on language
  const wordMap = language === 'hebrew' ? hebrewWordMap : greekWordMap;
  const dataSource = language === 'hebrew' ? mockHebrewData : mockGreekData;
  
  // Look up the Strong's number for the word
  const strongsNumber = wordMap[standardWord];
  
  if (!strongsNumber) {
    return null;
  }
  
  // TypeScript needs help with the index access
  if (strongsNumber in dataSource) {
    const result = dataSource[strongsNumber as keyof typeof dataSource];
    return result;
  }
  
  return null;
}

export async function GET(request: NextRequest) {
  // Don't require authentication for Strong's concordance lookups
  // This allows the feature to work for all users

  try {
    // Safe URL parsing with fallback for build-time
    let searchParams;
    try {
      searchParams = new URL(request.url).searchParams;
    } catch (e) {
      // During build/SSG, request.url might not be a valid URL
      // Provide fallback values for SSG
      searchParams = new URLSearchParams();
    }
    const word = searchParams.get('word');
    const language = searchParams.get('language');
    const number = searchParams.get('number');
    
    // If Strong's number is provided directly
    if (number) {
      // In a real implementation, we would fetch from a DB or API
      // For now, we'll use our mock data
      const prefix = number.charAt(0).toUpperCase();
      const mockData = prefix === 'H' ? mockHebrewData : mockGreekData;
      
      // Check if the number exists in our mock data
      if (number in mockData) {
        const strongsData = mockData[number as keyof typeof mockData];
        return NextResponse.json(strongsData);
      } else {
        return NextResponse.json(
          { error: `Strong's number ${number} not found` },
          { status: 404 }
        );
      }
    }
    
    // Otherwise, we need both a word and language to look up
    if (!word || !language) {
      return NextResponse.json(
        { error: 'Word and language are required parameters' },
        { status: 400 }
      );
    }
    
    if (language !== 'hebrew' && language !== 'greek') {
      return NextResponse.json(
        { error: 'Language must be either "hebrew" or "greek"' },
        { status: 400 }
      );
    }

    // In a real implementation, we would fetch from an API
    // For development, we'll use mock data
    const strongsData = getMockStrongsData(word, language);
    
    if (!strongsData) {
      return NextResponse.json(
        { error: `No Strong's data found for "${word}" in ${language}` },
        { status: 404 }
      );
    }
    
    return NextResponse.json(strongsData);
  } catch (error) {
    console.error('Strong\'s API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Strong\'s data. Please try again later.' },
      { status: 500 }
    );
  }
}