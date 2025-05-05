import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/openai';
import { ENV } from '@/lib/env';
import OpenAI from 'openai';

type MessageForAPI = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type SermonPoint = {
  title: string;
  content: string;
};

type Sermon = {
  title: string;
  introduction: string;
  mainPoints: SermonPoint[];
  conclusion: string;
  scriptureReferences: string[];
  fullText?: string;
  error?: string;
};

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const { passage, title, theme, length } = requestBody;
    
    // Validate required parameters
    if (!passage) {
      return NextResponse.json({ error: 'Bible passage is required' }, { status: 400 });
    }
    
    // Use provided parameters or defaults
    const biblePassage = passage;
    const sermonTitle = title || '';
    const sermonTheme = theme || '';
    const sermonLength = length || 'medium';
    
    console.log('Sermon Fallback API: Generating sermon for:', { 
      passage: biblePassage,
      title: sermonTitle || '(auto-generate)',
      theme: sermonTheme || '(not specified)',
      length: sermonLength
    });
    
    // Check if OpenAI API key is available
    const apiKey = process.env.OPENAI_API_KEY || ENV.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('Sermon Fallback API: Missing OpenAI API key');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured. Please contact the administrator.' }, 
        { status: 503 }
      );
    }

    // Get the OpenAI client
    console.log('Sermon Fallback API: Creating OpenAI client');
    const openai = createClient();
    
    try {
      // Build the prompt for sermon generation
      let prompt = `Create a complete sermon based on ${biblePassage}`;
      
      if (sermonTitle) {
        prompt += ` with the title "${sermonTitle}"`;
      }
      
      if (sermonTheme) {
        prompt += ` focusing on the theme of ${sermonTheme}`;
      }
      
      // Add specifications for length
      let wordCount = 1000; // default medium length
      if (sermonLength === 'short') {
        wordCount = 700;
        prompt += `. Make it concise (about 700 words)`;
      } else if (sermonLength === 'long') {
        wordCount = 1500;
        prompt += `. Make it comprehensive (about 1500 words)`;
      } else {
        prompt += `. Make it a standard length (about 1000 words)`;
      }
      
      // Add structure requirements
      prompt += `.

Structure the sermon with the following sections clearly marked with markdown headings:

## Title
A compelling sermon title (if not provided)

## Introduction
An engaging introduction that establishes the context and relevance of the passage

## Main Points
Three clear main points with each having a descriptive subtitle

## Conclusion
A meaningful conclusion that summarizes the message and provides application

Include appropriate Scripture references throughout. Make the sermon pastoral, biblically sound, and applicable to modern believers.`;
      
      // Create a system message to instruct the model
      const systemMessage: MessageForAPI = {
        role: 'system',
        content: `You are an experienced pastor and theologian who creates biblically sound, engaging, and applicable sermons.
        Focus on careful exegesis of the biblical text while making practical applications.
        Use clear structure with introduction, main points, and conclusion.
        Include Scripture references and theological insights while maintaining pastoral warmth.
        Create content that's faithful to the biblical text and helpful for spiritual growth.`
      };
      
      // Create a properly typed array of messages for the OpenAI API
      const formattedMessages: Array<MessageForAPI> = [
        systemMessage,
        {
          role: 'user' as const,
          content: prompt
        }
      ];
      
      console.log('Sermon Fallback API: Sending request to OpenAI');
      
      // Make the request to the OpenAI API
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 1,
        frequency_penalty: 0.2,
        presence_penalty: 0.1
      });
      
      // Extract the response text
      const sermonText = completion.choices[0].message.content || '';
      console.log('Sermon Fallback API: Received response from OpenAI', {
        length: sermonText.length,
        preview: sermonText.substring(0, 50) + (sermonText.length > 50 ? '...' : '')
      });
      
      if (!sermonText) {
        throw new Error('Empty response received from OpenAI');
      }
      
      // Parse the sermon text into structured format
      console.log('Sermon Fallback API: Parsing sermon text');
      
      // Extract sections using markdown headers
      const sections = sermonText.split(/##\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      console.log(`Sermon Fallback API: Found ${sections.length} sections in the sermon`);
      
      // Extract title
      let extractedTitle = sermonTitle; // Use provided title if available
      
      // If no title was provided, try to extract it from the sermon
      if (!extractedTitle) {
        const titleSection = sections.find(s => 
          s.toLowerCase().startsWith('title') || 
          s.split('\n')[0].toLowerCase().includes('title')
        );
        
        if (titleSection) {
          extractedTitle = titleSection
            .replace(/title\s*:\s*/i, '')
            .split('\n')[0]
            .trim();
          console.log('Sermon Fallback API: Extracted title:', extractedTitle);
        } else if (sections.length > 0) {
          // Use the first section as title if needed
          extractedTitle = sections[0].split('\n')[0].trim();
          console.log('Sermon Fallback API: Using first section as title:', extractedTitle);
        } else {
          extractedTitle = `Sermon on ${biblePassage}`;
          console.log('Sermon Fallback API: Using default title:', extractedTitle);
        }
      }
      
      // Extract introduction
      let introduction = '';
      const introSection = sections.find(s => 
        s.toLowerCase().startsWith('introduction') || 
        s.split('\n')[0].toLowerCase().includes('introduction')
      );
      
      if (introSection) {
        introduction = introSection
          .replace(/introduction\s*:\s*/i, '')
          .replace(/^introduction\s*/i, '')
          .replace(/^[^\n]*\n/, '') // Remove the title line
          .trim();
        console.log(`Sermon Fallback API: Found introduction with ${introduction.length} characters`);
      } else if (sections.length > 1) {
        // Use the second section as introduction if no specific intro section
        introduction = sections[1].replace(/^[^\n]*\n/, '').trim();
        console.log(`Sermon Fallback API: Using section as introduction, ${introduction.length} chars`);
      } else {
        introduction = `As we explore ${biblePassage}, we'll discover important insights for our faith journey.`;
        console.log('Sermon Fallback API: Using default introduction');
      }
      
      // Extract main points
      let mainPoints: SermonPoint[] = [];
      const pointSections = sections.filter(s => 
        s.toLowerCase().startsWith('main point') || 
        s.toLowerCase().startsWith('point') ||
        s.split('\n')[0].toLowerCase().includes('point')
      );
      
      if (pointSections.length > 0) {
        mainPoints = pointSections.map(section => {
          const lines = section.split('\n');
          const title = lines[0].replace(/main point\s*\d*\s*:\s*/i, '').trim();
          const content = lines.slice(1).join('\n').trim();
          return { title, content };
        });
        console.log(`Sermon Fallback API: Found ${mainPoints.length} main points`);
      } else {
        // Try to extract points from a single main points section
        const mainPointsSection = sections.find(s => 
          s.toLowerCase().startsWith('main points') || 
          s.split('\n')[0].toLowerCase().includes('main points')
        );
        
        if (mainPointsSection) {
          // Remove the header and split by numbered points or subheadings
          const content = mainPointsSection
            .replace(/main points\s*:\s*/i, '')
            .replace(/^[^\n]*\n/, '')
            .trim();
          
          // Look for numbered points (1., 2., etc.) or subheadings (### Point 1)
          const pointMatches = Array.from(
            content.matchAll(/(?:^|\n)((?:\d+\.\s*|###\s*)[^\n]+)(\n[\s\S]*?)(?=(?:\d+\.\s*|###\s*)|$)/g)
          );
          
          if (pointMatches.length > 0) {
            mainPoints = pointMatches.map(match => {
              const title = match[1].replace(/^\d+\.\s*|###\s*/g, '').trim();
              const content = match[2].trim();
              return { title, content };
            });
            console.log(`Sermon Fallback API: Extracted ${mainPoints.length} points from main points section`);
          }
        }
        
        // If still no points, create a default one
        if (mainPoints.length === 0) {
          mainPoints = [{
            title: `Key Insights from ${biblePassage}`,
            content: `This passage offers important teachings that remain relevant today. Consider how these biblical principles apply to your own life and spiritual journey.`
          }];
          console.log('Sermon Fallback API: Using default main points');
        }
      }
      
      // Extract conclusion
      let conclusion = 'May God bless you as you apply the teachings from ' + biblePassage;
      
      // First try the markdown format
      const conclusionSection = sections.find(s => 
        s.toLowerCase().startsWith('conclusion') || 
        s.split('\n')[0].toLowerCase().includes('conclusion')
      );
      
      if (conclusionSection) {
        conclusion = conclusionSection
          .replace(/conclusion\s*:\s*/i, '')
          .replace(/^conclusion\s*/i, '')
          .replace(/^[^\n]*\n/, '') // Remove the title line
          .trim();
        console.log(`Sermon Fallback API: Found conclusion with ${conclusion.length} characters`);
      } else if (sections.length > 3) {
        // Use the last section as conclusion if reasonable
        conclusion = sections[sections.length - 1].replace(/^[^\n]*\n/, '').trim();
        console.log(`Sermon Fallback API: Using last section as conclusion, ${conclusion.length} chars`);
      }
      
      // Extract scripture references
      const scriptureRegex = /\b(?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1 Samuel|2 Samuel|1 Kings|2 Kings|1 Chronicles|2 Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1 Corinthians|2 Corinthians|Galatians|Ephesians|Philippians|Colossians|1 Thessalonians|2 Thessalonians|1 Timothy|2 Timothy|Titus|Philemon|Hebrews|James|1 Peter|2 Peter|1 John|2 John|3 John|Jude|Revelation)\s+\d+(?::\d+(?:-\d+)?)?(?:,\s*\d+(?::\d+(?:-\d+)?)?)*\b/gi;
      
      const scriptureReferences = [biblePassage]; // Always include the main passage
      const additionalReferences = Array.from(sermonText.matchAll(scriptureRegex))
        .map(match => match[0]);
      
      // Add additional unique references
      additionalReferences.forEach(reference => {
        if (!scriptureReferences.includes(reference)) {
          scriptureReferences.push(reference);
        }
      });
      
      console.log(`Sermon Fallback API: Found ${scriptureReferences.length} scripture references`);
      
      // Create the sermon object
      const sermon: Sermon = {
        title: extractedTitle,
        introduction,
        mainPoints,
        conclusion,
        scriptureReferences: Array.from(new Set(scriptureReferences)), // Remove duplicates
        fullText: sermonText
      };
      
      console.log('Sermon Fallback API: Successfully generated sermon');
      return NextResponse.json(sermon);
      
    } catch (apiError) {
      console.error('Sermon Fallback API: Error calling OpenAI:', apiError);
      
      // Try to provide more details for debugging
      if (apiError instanceof Error) {
        console.error('Sermon Fallback API: Error details:', {
          name: apiError.name,
          message: apiError.message,
          stack: apiError.stack
        });
      }
      
      const errorMessage = apiError instanceof Error 
        ? apiError.message 
        : 'Unknown API error';
      
      // Create a basic fallback sermon with error message
      const fallbackSermon: Sermon = {
        title: sermonTitle || 'Sermon on ' + biblePassage,
        introduction: 'Introduction to ' + biblePassage,
        mainPoints: [{
          title: 'Main Point',
          content: 'Reflection on the meaning and application of ' + biblePassage
        }],
        conclusion: 'May God bless you as you apply these truths from ' + biblePassage,
        scriptureReferences: [biblePassage],
        error: errorMessage
      };
      
      return NextResponse.json(fallbackSermon);
    }
  } catch (error) {
    console.error('Sermon Fallback API: Unhandled error:', error);
    
    if (error instanceof Error) {
      console.error('Sermon Fallback API: Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to generate sermon. Please try again later.' },
      { status: 500 }
    );
  }
}
