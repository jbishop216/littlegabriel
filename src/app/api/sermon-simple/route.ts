import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/openai';
import { ENV } from '@/lib/env';
import { shouldUseFallback } from '@/lib/openai-fallback-check';

// Gabriel Assistant ID from the OpenAI dashboard
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID || ENV.OPENAI_ASSISTANT_ID || 'asst_BpFiJmyhoHFYUj5ooLEoHEX2';

// Check if we should immediately redirect to fallback based on environment
const USE_FALLBACK = shouldUseFallback();
if (USE_FALLBACK) {
  console.log('Sermon Generator API: Using fallback mode based on environment check');
}

export async function POST(req: NextRequest) {
  try {
    // If we should use fallback mode, redirect to the fallback API endpoint
    if (USE_FALLBACK) {
      console.log('Sermon Generator API: Redirecting to fallback endpoint');
      // Clone the request and forward it to the fallback endpoint
      const response = await fetch(new URL('/api/sermon-simple-fallback', req.url), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: req.body
      });
      
      // Return the response directly
      if (response.ok) {
        const responseData = await response.json();
        console.log('Sermon Generator API: Fallback responded successfully');
        return NextResponse.json(responseData);
      } else {
        const errorData = await response.json();
        console.error('Sermon Generator API: Fallback endpoint error:', errorData);
        return NextResponse.json(errorData, { status: response.status });
      }
    }
    
    // Otherwise continue with the normal Assistant-based implementation
    // Check authentication - support both NextAuth session and direct auth
    const session = await getServerSession(authOptions);
    
    // Also check for direct authentication via headers
    const authHeader = req.headers.get('authorization');
    const userEmail = req.headers.get('x-user-email');
    
    // Get cookies for session-based auth
    const cookies = req.cookies;
    const sessionToken = cookies.get('next-auth.session-token')?.value || cookies.get('__Secure-next-auth.session-token')?.value;
    
    // Log authentication attempt
    console.log('Sermon API auth check:', { 
      hasSession: !!session?.user,
      hasAuthHeader: !!authHeader,
      hasUserEmail: !!userEmail,
      hasSessionToken: !!sessionToken
    });
    
    // Allow access if user has either NextAuth session or direct auth
    const isAuthenticated = !!session?.user || !!authHeader || !!userEmail || !!sessionToken;
    if (!isAuthenticated) {
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

    // Log the received data
    console.log('Sermon API received data:', { 
      hasTitle: !!title,
      biblePassage,
      theme,
      audienceType,
      lengthMinutes,
      hasAdditionalNotes: !!additionalNotes,
      userEmail
    });
    
    // Validate required fields
    if (!biblePassage || biblePassage.trim() === '') {
      return NextResponse.json(
        { error: 'Bible passage is required' },
        { status: 400 }
      );
    }
    
    if (!theme || theme.trim() === '') {
      return NextResponse.json(
        { error: 'Theme is required' },
        { status: 400 }
      );
    }

    // Initialize the OpenAI client
    const openai = createClient();
    console.log('Starting sermon generation using Assistant API (Simple)');

    try {
      // Create a thread for this sermon request
      const thread = await openai.beta.threads.create();
      console.log('Created thread for sermon generation:', thread.id);

      // Create user prompt with clearer formatting requirements and explicit structure
      const userPrompt = `
        Create a COMPREHENSIVE, DETAILED sermon on Bible passage: ${biblePassage}
        Theme: ${theme}
        ${title ? `Title suggestion: ${title}` : ''}
        Target Audience: ${audienceType || 'General congregation'}
        Approximate Length: ${lengthMinutes || '20'} minutes
        ${additionalNotes ? `Additional Notes: ${additionalNotes}` : ''}

        CRITICAL: This sermon MUST be substantive and detailed with AT LEAST 2000-3000 WORDS TOTAL. Provide FULL paragraphs of content for EVERY section. The client has specifically requested detailed content, not just headings or brief outlines.

        Format the sermon EXACTLY as follows with these MANDATORY sections:

        # [TITLE: Clear, engaging title related to the passage]

        ## Introduction
        [Write 300-400 words here providing historical and Biblical context for ${biblePassage}, explaining its significance to Christians today, and clearly stating the main message. DO NOT just list bullet points - write full, flowing paragraphs with substantial content.]

        ## 1. [First Main Point Title]
        [Write 400-500 words here developing this point fully. Include theological insights, supporting scripture references, real-world applications, and illustrative examples or stories. Write complete paragraphs, not bullet points.]

        ## 2. [Second Main Point Title]
        [Write 400-500 words here developing this second point fully with theological insights, supporting scripture references, real-world applications, and illustrative examples. Use complete paragraphs.]

        ## 3. [Third Main Point Title]
        [Write 400-500 words here fully developing this third point with insights, references, applications and examples. Use complete paragraphs.]

        ## Conclusion
        [Write 250-300 words summarizing the key message, providing practical application steps, and ending with an inspiring call to action. Use complete paragraphs.]

        ## Scripture References
        [List all scripture references used in the sermon]

        DO NOT abbreviate any section. Each main point MUST contain multiple paragraphs of substantive content (not just headings or one-liners). This is for actual preaching, so it must be thorough, substantive, and provide COMPLETE sermon content that a pastor could preach directly.
      `;

      // Add the user's sermon request to the thread
      await openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: userPrompt
      });
      console.log('Added sermon request to thread');

      // Run the assistant on the thread
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: ASSISTANT_ID,
        instructions: `Generate an extremely detailed, comprehensive sermon on the requested Bible passage. 
        
CRITICAL REQUIREMENTS:
1. The sermon MUST be 2000-3000 words total with substantial paragraphs in EVERY section
2. Format with markdown headings exactly as specified in the user prompt
3. Each main point MUST contain 400-500 words of detailed content, not just bullet points
4. Include theological insights, supporting scriptures, real-world applications and illustrative stories
5. Follow the structure in the user prompt EXACTLY with # and ## markdown headings
6. Do not abbreviate any section - provide FULL paragraphs throughout

Format exactly as:
# Title
## Introduction
[300-400 words]
## 1. First Point Title
[400-500 words]
## 2. Second Point Title 
[400-500 words]
## 3. Third Point Title
[400-500 words]
## Conclusion
[250-300 words]
## Scripture References
[List references]

Focus on biblical accuracy, theological depth, practical application, and providing COMPLETE sermon content that could be preached directly without additions.`
      });
      console.log('Started sermon assistant run:', run.id);

      // Poll for the completion of the run
      let completedRun = await pollRunCompletion(openai, thread.id, run.id);
      console.log('Sermon run completed with status:', completedRun.status);

      if (completedRun.status !== 'completed') {
        throw new Error(`Sermon generation run failed with status: ${completedRun.status}`);
      }

      // Get the assistant's message from the thread
      const messages = await openai.beta.threads.messages.list(thread.id);
      const assistantMessages = messages.data.filter(msg => msg.role === 'assistant');
      
      if (assistantMessages.length === 0) {
        throw new Error('No assistant messages found in sermon thread');
      }

      // Get the latest message
      const latestMessage = assistantMessages[0];
      
      // Extract the content from the message
      let sermonText = '';
      for (const content of latestMessage.content) {
        if (content.type === 'text') {
          sermonText += content.text.value;
        }
      }
      
      // Log the raw sermon text to debug the content we're receiving
      console.log('Raw sermon text received from OpenAI:');
      console.log(sermonText.substring(0, 1000) + '...' + sermonText.substring(sermonText.length - 1000));

      // Extract title (assuming it's at the beginning of the response)
      let extractedTitle = title || 'Sermon on ' + biblePassage;
      const titleMatch = sermonText.match(/^#?\s*(.+?)(?:\n|$)/);
      if (titleMatch) {
        extractedTitle = titleMatch[1].trim();
      }

      // Very simple processing to identify parts of the sermon
      const sections = sermonText.split(/(?:\n\s*){2,}/);
      
      // Identify introduction using markdown format "## Introduction"
      let introduction = 'Introduction to ' + biblePassage;
      
      // Look for introduction section
      const introMatch = sermonText.match(/##\s*Introduction\s*\n([\s\S]+?)(?=##|\n\s*$)/i);
      if (introMatch && introMatch[1]) {
        introduction = introMatch[1].trim();
        console.log(`Found introduction with ${introduction.length} characters`);
      } else if (sections.length > 1) {
        // Fallback to old method
        introduction = sections[1];
        console.log(`Using fallback introduction method, found ${introduction.length} characters`);
      }
      
      // Look for main points using markdown format ## 1. Point Title
      // This matches both our new format and older formats
      const pointLines = sermonText.split('\n').filter(line => 
        line.trim().match(/^(##\s*[0-9]+\.|##\s+[0-9]+\s+|[0-9]+\.\s+|Point\s+\d+:)/)
      );
      
      // Log the detected point lines to help debug
      console.log('Detected point lines in sermon text:');
      console.log(pointLines);
      
      // Extract main points with improved content extraction
      const mainPoints = pointLines.length > 0 
        ? pointLines.map((pointLine, index) => {
            console.log(`Processing point ${index + 1}: "${pointLine}"`);
            
            // Get the point's starting position
            const pointStartIndex = sermonText.indexOf(pointLine);
            console.log(`Point starts at index ${pointStartIndex}`);
            
            // Find the end of this point (either the next point, conclusion, or a section break)
            let pointEndIndex;
            
            // First, try to find the next point
            if (index < pointLines.length - 1) {
              const nextPointLine = pointLines[index + 1];
              pointEndIndex = sermonText.indexOf(nextPointLine);
              console.log(`Next point found at index ${pointEndIndex}`);
            } else {
              // If this is the last point, look for conclusion markers
              const conclusionPatterns = [
                /\n\s*conclusion\s*:/i,
                /\n\s*conclusion\s*\n/i,
                /\n\s*in\s+conclusion\s*:/i,
                /\n\s*in\s+conclusion\s*\n/i
              ];
              
              let foundConclusion = false;
              for (const pattern of conclusionPatterns) {
                const match = sermonText.substring(pointStartIndex).match(pattern);
                if (match && match.index) {
                  pointEndIndex = pointStartIndex + match.index;
                  foundConclusion = true;
                  console.log(`Conclusion found at index ${pointEndIndex}`);
                  break;
                }
              }
              
              // If no conclusion found, look for a substantial paragraph break
              if (!foundConclusion) {
                const paragraphBreak = sermonText.substring(pointStartIndex).match(/\n\s*\n\s*\n/);
                if (paragraphBreak && paragraphBreak.index && paragraphBreak.index > 100) {
                  // Only use paragraph breaks that are substantially after the point starts
                  pointEndIndex = pointStartIndex + paragraphBreak.index;
                  console.log(`Paragraph break found at index ${pointEndIndex}`);
                } else {
                  // If nothing else is found, just take all remaining text
                  pointEndIndex = sermonText.length;
                  console.log(`No endpoint found, using text length: ${pointEndIndex}`);
                }
              }
            }
            
            // Extract the full point text including all paragraphs
            const fullPointText = sermonText.substring(pointStartIndex, pointEndIndex).trim();
            console.log(`Full point text length: ${fullPointText.length} characters`);
            
            // Try to extract title from the point line - support both markdown and standard formats
            const titleMatch = pointLine.match(/(?:##\s*[0-9]+\.|##\s+[0-9]+\s+|[0-9]+\.\s+|Point\s+\d+:)\s*(.+?)(?:[-:]\s*|\n|$)/);
            const title = titleMatch ? titleMatch[1].trim() : `Main Point ${index + 1}`;
            console.log(`Extracted title: "${title}"`);
            
            // Get all content after the title line (first find where the first line ends)
            const firstLineEndIndex = fullPointText.indexOf('\n');
            
            // Only use the part after the first line if it has enough content
            let content;
            if (firstLineEndIndex > -1) {
              content = fullPointText.substring(firstLineEndIndex).trim();
              console.log(`Content after title line is ${content.length} characters`);
              
              // If content is too short, use the full text including title
              if (content.length < 50) {
                content = fullPointText;
                console.log(`Content too short, using full text of ${content.length} characters`);
              }
            } else {
              content = fullPointText;
              console.log(`No line break found, using full text of ${content.length} characters`);
            }
            
            // Final check - if content is still very short, add a generic message
            if (content.length < 30) {
              content = `${content}\n\nThis point explores how ${biblePassage} teaches us about God's unconditional love for humanity and how we can respond to this gift through faith, service, and spiritual growth.`;
              console.log("Content still too short, added generic message");
            }
            
            return { 
              title,
              content: content 
            };
          })
        : [{ 
            title: 'The Message of ' + biblePassage, 
            content: `${biblePassage} is one of the most profound verses in the Bible, revealing God's immense love for humanity and the promise of salvation through faith in Jesus Christ. This fundamental teaching reminds us that God's love is unconditional and His gift of eternal life is available to all who believe. As you reflect on this passage, consider how it speaks to your own faith journey and relationship with God.`
          }];
      
      // Look for conclusion using markdown format "## Conclusion"
      let conclusion = 'May God bless you as you apply the teachings from ' + biblePassage;
      
      // First try the markdown format
      const conclusionMatch = sermonText.match(/##\s*Conclusion\s*\n([\s\S]+?)(?=##|\n\s*$)/i);
      if (conclusionMatch && conclusionMatch[1]) {
        conclusion = conclusionMatch[1].trim();
        console.log(`Found conclusion with ${conclusion.length} characters using markdown format`);
      } else {
        // Try the older format if markdown not found
        const conclusionSection = sections.find(section => 
          section.toLowerCase().startsWith('conclusion') || 
          section.toLowerCase().includes('in conclusion')
        );
        
        if (conclusionSection) {
          conclusion = conclusionSection.replace(/^(Conclusion:?|In\s+conclusion)/i, '').trim();
          console.log(`Found conclusion with ${conclusion.length} characters using text search`);
        } else if (sections.length > 2) {
          // If no explicit conclusion, use the last section
          conclusion = sections[sections.length - 1];
          console.log(`Using last section as conclusion with ${conclusion.length} characters`);
        }
      }
      
      // Extract scripture references - use simple regex that doesn't need matchAll
      const scriptureRegex = /(?:[0-9]\s)?[A-Za-z]+\s+\d+:\d+(?:-\d+)?/g;
      const scriptureReferences = [biblePassage];
      let scriptureMatch;
      const foundScriptures = new Set<string>();
      
      while ((scriptureMatch = scriptureRegex.exec(sermonText)) !== null) {
        const reference = scriptureMatch[0];
        if (reference !== biblePassage && !foundScriptures.has(reference)) {
          scriptureReferences.push(reference);
          foundScriptures.add(reference);
        }
      }

      // Create the sermon object 
      const sermon = {
        title: extractedTitle,
        introduction,
        mainPoints,
        conclusion,
        scriptureReferences: Array.from(new Set(scriptureReferences)), // Remove duplicates
        fullText: sermonText
      };
      
      return NextResponse.json(sermon);
    } catch (error: any) {
      console.error('Error with Assistant API:', error);
      
      // Check if this is a "no assistant found" error (common in production)
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('No assistant found with id')) {
        console.log('Sermon Generator: Detected missing assistant error, redirecting to fallback');
        // Redirect to the fallback endpoint
        const response = await fetch(new URL('/api/sermon-simple-fallback', req.url), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            biblePassage,
            theme,
            audienceType,
            lengthMinutes,
            additionalNotes
          })
        });
        
        if (response.ok) {
          const responseData = await response.json();
          console.log('Sermon Generator: Successfully used fallback after Assistant error');
          return NextResponse.json(responseData);
        }
      }
      
      // Create a basic fallback sermon as last resort
      const fallbackSermon = {
        title: title || 'Sermon on ' + biblePassage,
        introduction: 'Introduction to ' + biblePassage,
        mainPoints: [{
          title: 'Main Point',
          content: 'Reflection on the meaning and application of ' + biblePassage
        }],
        conclusion: 'May God bless you as you apply these truths from ' + biblePassage,
        scriptureReferences: [biblePassage],
        error: error.message || 'An error occurred generating the sermon'
      };
      
      return NextResponse.json(fallbackSermon);
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
async function pollRunCompletion(openai: any, threadId: string, runId: string) {
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