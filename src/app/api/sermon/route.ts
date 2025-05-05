import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/openai';
import OpenAI from 'openai';

// Gabriel Assistant ID from the OpenAI dashboard
const ASSISTANT_ID = 'asst_BpFiJmyhoHFYUj5ooLEoHEX2';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const {
      title,
      biblePassage,
      theme,
      audienceType,
      lengthMinutes,
      additionalNotes,
    } = await req.json();

    // Validate required fields
    if (!biblePassage || !theme) {
      return NextResponse.json(
        { error: 'Bible passage and theme are required' },
        { status: 400 }
      );
    }

    // Create user prompt for sermon generation
    const userPrompt = `
      Please create a sermon with the following specifications:
      ${title ? `Title: ${title} (or suggest a better one if appropriate)` : 'Please suggest an appropriate title.'}
      Bible Passage: ${biblePassage}
      Theme: ${theme}
      Target Audience: ${audienceType}
      Approximate Length: ${lengthMinutes} minutes
      ${additionalNotes ? `Additional Notes: ${additionalNotes}` : ''}

      The sermon should include:
      1. A compelling introduction that explains the context of the scripture
      2. ${lengthMinutes <= 15 ? '2-3' : lengthMinutes <= 30 ? '3-4' : '4-5'} main points with Biblical support and explanation
      3. Practical applications for daily life
      4. A powerful conclusion with a call to action
      5. Additional scripture references that support the message
      
      VERY IMPORTANT: Adjust the length of the sermon content based on the requested length of ${lengthMinutes} minutes.
      - For a ${lengthMinutes} minute sermon, the content should be ${lengthMinutes <= 15 ? 'concise and focused' : lengthMinutes <= 30 ? 'moderately detailed' : 'comprehensive and detailed'}.
      - The introduction should be ${lengthMinutes <= 15 ? 'brief' : lengthMinutes <= 30 ? 'moderate' : 'thorough'}.
      - Each main point should be ${lengthMinutes <= 15 ? 'briefly explained' : lengthMinutes <= 30 ? 'well-developed' : 'extensively developed with multiple sub-points'}.
      - If the requested length is 5-15 minutes, keep the sermon very focused with shorter sections.
      - If the requested length is 15-30 minutes, provide moderate detail in each section.
      - If the requested length is 30-45 minutes, provide extensive detail, deeper theological insights, and more examples in each section.
      
      Make the sermon relatable, inspirational, and grounded in Biblical truth, with the total content length appropriate for a ${lengthMinutes}-minute sermon.

      RESPONSE FORMAT: Your response must be formatted as a valid JSON object with the following structure:
      {
        "title": "Sermon title",
        "introduction": "Opening paragraph introducing the topic",
        "mainPoints": [
          {
            "title": "Point 1 Title",
            "content": "Detailed explanation of point 1"
          }
        ],
        "conclusion": "Concluding thoughts",
        "scriptureReferences": ["Scripture references used"],
        "illustrations": ["Optional illustrative stories or examples"]
      }
    `;

    // Initialize the OpenAI client
    const openai = createClient();
    console.log('Starting sermon generation using Assistant API');
    
    try {
      // Create a thread for this sermon request
      const thread = await openai.beta.threads.create();
      console.log('Created thread for sermon generation:', thread.id);

      // Add the user's sermon request to the thread
      await openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: userPrompt
      });
      console.log('Added sermon request to thread');

      // Run the assistant on the thread with specific sermon generation instructions
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: ASSISTANT_ID,
        instructions: "You are generating a sermon. Focus exclusively on creating a well-structured, biblically sound sermon based on the request. Your response MUST be formatted as a valid JSON object with the following structure exactly: \n\n" +
        "{\n" +
        "  \"title\": \"Sermon title\",\n" +
        "  \"introduction\": \"Opening paragraph introducing the topic\",\n" +
        "  \"mainPoints\": [\n" +
        "    {\n" +
        "      \"title\": \"Point 1 Title\",\n" +
        "      \"content\": \"Detailed explanation of point 1\"\n" +
        "    }\n" +
        "  ],\n" +
        "  \"conclusion\": \"Concluding thoughts\",\n" +
        "  \"scriptureReferences\": [\"Scripture references used\"],\n" +
        "  \"illustrations\": [\"Optional illustrative stories or examples\"]\n" +
        "}\n\n" +
        "STRICT JSON FORMATTING RULES:\n" +
        "1. Use double quotes ONLY for JSON property names and string values\n" +
        "2. NEVER use single quotes in the JSON itself\n" +
        "3. If you need to include quotes within a string, use escaped double quotes\n" +
        "4. NEVER include any control characters, line breaks, or special formatting in strings\n" +
        "5. NEVER include any markdown formatting in your response\n" +
        "6. DO NOT include any explanatory text before or after the JSON\n" +
        "7. Make sure your response is 100% valid JSON that can be parsed with JSON.parse()\n\n" +
        "CRITICAL: Adjust the sermon's LENGTH and DETAIL based on the requested sermon length in minutes. Make sure your response is EXACTLY in the required JSON format with no markdown formatting, extra text, or explanations outside the JSON structure."
      });
      console.log('Started sermon assistant run:', run.id);

      // Poll for the completion of the run
      let completedRun = await pollRunCompletion(openai, thread.id, run.id);
      console.log('Sermon run completed with status:', completedRun.status);

      if (completedRun.status !== 'completed') {
        throw new Error(`Sermon generation run failed with status: ${completedRun.status}`);
      }

      // Get the assistant's message from the thread
      const threadMessages = await openai.beta.threads.messages.list(thread.id);
      console.log('Retrieved sermon messages from thread, count:', threadMessages.data.length);

      // Find the assistant's messages (should be the latest)
      const assistantMessages = threadMessages.data
        .filter(msg => msg.role === 'assistant')
        .sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

      if (assistantMessages.length === 0) {
        throw new Error('No assistant messages found in sermon thread');
      }

      // Get the latest message
      const latestMessage = assistantMessages[0];
      console.log('Latest sermon assistant message found, id:', latestMessage.id);

      // Extract the content from the message
      let responseText = '';
      for (const content of latestMessage.content) {
        if (content.type === 'text') {
          responseText += content.text.value;
        }
      }
      console.log('Sermon response text extracted, length:', responseText.length);

      try {
        // Clean and parse the JSON
        let cleanedJson = responseText;
        
        // If response is wrapped in markdown code blocks, extract just the JSON
        if (responseText.includes('```json')) {
          cleanedJson = responseText.split('```json')[1].split('```')[0].trim();
        } else if (responseText.includes('```')) {
          cleanedJson = responseText.split('```')[1].split('```')[0].trim();
        }
        
        // Remove any trailing commas in arrays or objects (common JSON error)
        cleanedJson = cleanedJson.replace(/,\s*([}\]])/g, '$1');
        
        // Ensure all property names use double quotes
        cleanedJson = cleanedJson.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
        
        // Convert any single quotes used for string values to double quotes
        // But first, escape any double quotes inside the single-quoted strings
        cleanedJson = cleanedJson.replace(/'([^']*?)'/g, function(match, p1) {
          // Replace any unescaped double quotes with escaped ones
          const escaped = p1.replace(/"/g, '\\"');
          return `"${escaped}"`;
        });
        
        // Remove control characters that cause JSON parsing issues
        cleanedJson = cleanedJson.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
        
        // Fix any problematic title: 'Text", 'introduction: 'Text" patterns (missing quotes)
        cleanedJson = cleanedJson.replace(/:\s*'([^']+)'/g, ': "$1"');
        
        // Fix mismatched quotes in property values
        cleanedJson = cleanedJson.replace(/"([^"]*)'([^']*)"/, '"$1\\\'$2"');
        
        // Handle nested quotes in property values by escaping them
        const fixNestedQuotes = (str: string): string => {
          return str.replace(/(")((?:[^"\\]|\\.)*?)(")((?:[^"\\]|\\.)*)(")((?:[^"\\]|\\.)*?)(")/g, 
            (match, q1, content1, q2, middle, q3, content2, q4) => {
              // If we have "text"more text"text", convert to "text\"more text\"text"
              return `${q1}${content1}\\"${middle}\\"${content2}${q4}`;
            });
        };
        
        // Fix common issue where title has mismatched quotes
        cleanedJson = cleanedJson.replace(/"title":\s*"([^"]*),\s*'([^']*)'/, '"title": "$1, $2"');
        
        // Apply fixes multiple times to catch nested issues
        for (let i = 0; i < 3; i++) {
          cleanedJson = fixNestedQuotes(cleanedJson);
        }
        
        // Log the cleaned JSON for debugging
        console.log('Cleaned JSON (first 200 chars):', cleanedJson.substring(0, 200));
        
        console.log('Attempting to parse cleaned JSON:', cleanedJson.substring(0, 100) + '...');
        
        // Define a sermon object type to avoid TypeScript errors
        interface SermonPoint {
          title: string;
          content: string;
        }
        
        interface SermonObject {
          title: string;
          introduction: string;
          mainPoints: SermonPoint[];
          conclusion: string;
          scriptureReferences: string[];
          illustrations?: string[];
          [key: string]: any; // Allow additional properties
        }
        
        let sermon: SermonObject | null = null;
        
        try {
          // Parse the JSON
          const parsedJson = JSON.parse(cleanedJson);
          sermon = parsedJson as SermonObject;
          
          // Validate the basic structure
          if (!sermon.title || !sermon.introduction || !Array.isArray(sermon.mainPoints) || !sermon.conclusion) {
            console.log('Missing required sermon structure fields');
            throw new Error('Invalid sermon structure returned from API');
          }
          
          // Successfully parsed - continue processing
          console.log('Successfully parsed sermon JSON');
        } catch (innerJsonError) {
          console.error('Inner JSON parsing error:', innerJsonError);
          
          // Try a more aggressive approach - use regex to extract a valid JSON object
          console.log('Attempting more aggressive JSON extraction...');
          
          // Look for patterns that might indicate a JSON object
          const jsonMatch = cleanedJson.match(/\{[\s\S]*\}/);
          
          if (jsonMatch) {
            try {
              const extractedJson = jsonMatch[0];
              console.log('Extracted potential JSON object:', extractedJson.substring(0, 100) + '...');
              
              // Try parsing the extracted object
              const extractedSermon = JSON.parse(extractedJson);
              
              if (!extractedSermon || typeof extractedSermon !== 'object') {
                throw new Error('Extracted JSON is not a valid object');
              }
              
              sermon = extractedSermon as SermonObject;
              console.log('Successfully parsed JSON with aggressive extraction');
            } catch (extractionError) {
              console.error('Extraction parsing error:', extractionError);
              throw innerJsonError; // Throw the original error
            }
          } else {
            throw innerJsonError; // If no JSON-like pattern was found
          }
        }
        
        // At this point, sermon should be defined if parsing succeeded
        if (!sermon) {
          throw new Error('Failed to parse sermon JSON');
        }
        
        // Ensure all required fields exist
        if (!sermon.title) sermon.title = `Sermon on ${biblePassage}`;
        if (!sermon.introduction) sermon.introduction = `Introduction to the sermon on ${biblePassage}`;
        if (!sermon.conclusion) sermon.conclusion = "May God bless you as you apply these truths.";
        
        // Ensure main points array exists
        if (!Array.isArray(sermon.mainPoints) || sermon.mainPoints.length === 0) {
          sermon.mainPoints = [{
            title: "Main Point",
            content: "The main content of this sermon focuses on applying biblical truths to our lives."
          }];
        }
        
        // Ensure all required arrays are present
        if (!Array.isArray(sermon.scriptureReferences)) {
          sermon.scriptureReferences = [biblePassage];
        }
        
        if (!Array.isArray(sermon.illustrations)) {
          sermon.illustrations = [];
        }
        
        // Ensure each main point has title and content
        sermon.mainPoints = sermon.mainPoints.map((point: any) => {
          if (!point.title) point.title = "Untitled Point";
          if (!point.content) point.content = "No content provided for this point.";
          return point;
        });
        
        // Return the processed sermon
        return NextResponse.json(sermon);
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        
        // Create a minimal valid sermon structure as fallback
        const fallbackSermon = {
          title: "Sermon on " + biblePassage,
          introduction: "Introduction to the sermon on " + biblePassage,
          mainPoints: [
            {
              title: "Main Point",
              content: "The sermon could not be properly formatted. Please try again."
            }
          ],
          conclusion: "Thank you for your patience.",
          scriptureReferences: [biblePassage],
          illustrations: [],
          error: "The sermon could not be properly formatted. Please try again with different parameters."
        };
        
        return NextResponse.json(fallbackSermon);
      }
    } catch (assistantError: any) {
      console.error('Error using Assistant API for sermon generation:', assistantError);
      return NextResponse.json(
        { error: 'Failed to generate sermon with Assistant API: ' + (assistantError?.message || 'Unknown assistant error') },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error generating sermon:', error);
    return NextResponse.json(
      { error: 'Failed to generate sermon: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}

// Helper function to poll for run completion
async function pollRunCompletion(openai: OpenAI, threadId: string, runId: string) {
  console.log('Polling for sermon run completion...');
  
  let run = await openai.beta.threads.runs.retrieve(threadId, runId);
  console.log('Initial sermon run status:', run.status);
  
  // Define terminal states where polling should stop
  const terminalStates = ['completed', 'failed', 'cancelled', 'expired'];
  
  // Poll until we reach a terminal state
  while (!terminalStates.includes(run.status)) {
    // Wait 1 second before checking again
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get the updated run status
    run = await openai.beta.threads.runs.retrieve(threadId, runId);
    console.log('Updated sermon run status:', run.status);
  }
  
  return run;
}