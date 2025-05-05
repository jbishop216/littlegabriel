import { Stream } from 'openai/streaming';
import { ChatCompletionChunk } from 'openai/resources';

/**
 * Custom stream processor for OpenAI streams that removes numeric prefixes
 * from the content before returning it and ensures proper AI SDK compatibility.
 * 
 * Uses the AI SDK format for streamed responses:
 * data: {"text": "token text here"}
 */
export function CustomOpenAIStream(
  stream: Stream<ChatCompletionChunk>,
  options?: {
    onStart?: () => void;
    onCompletion?: (completion: string) => void;
    onToken?: (token: string) => void;
  }
): ReadableStream {
  const { onStart, onCompletion, onToken } = options ?? {};
  let fullContent = '';
  let contentStarted = false;

  // Create a ReadableStream directly
  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      // Call onStart if provided
      onStart?.();
      
      try {
        console.log('Stream processing starting');
        
        // Process each token as it comes
        for await (const chunk of stream) {
          // Extract content, safely handling potential undefined values
          const content = chunk.choices?.[0]?.delta?.content || '';
          
          // If no content, skip this token
          if (!content) continue;
          
          // Clean the token before passing it on
          let cleanToken = content;
          
          // If this is the beginning of the content, clean leading numeric indicators (like "0:")
          if (!contentStarted) {
            cleanToken = cleanToken.replace(/^\d+:["']?\s*/g, '');
            contentStarted = true;
            console.log('Content stream started, first token cleaned:', { 
              originalLength: content.length, 
              cleanedLength: cleanToken.length 
            });
          }
          
          // Clean any "n:" patterns in the middle of the text
          cleanToken = cleanToken.replace(/\s\d+:["']?\s*/g, ' ');
          
          // Fix any doubled spaces
          cleanToken = cleanToken.replace(/\s{2,}/g, ' ');
          
          // Update our full content tracker
          fullContent += cleanToken;
          
          // Call token callback if provided
          onToken?.(cleanToken);
          
          try {
            // Format token for AI SDK consumption
            // The AI SDK expects data in the format: data: {"text": "token text"}
            const aiSdkFormattedData = `data: ${JSON.stringify({ text: cleanToken })}\n\n`;
            
            // Encode and send the properly formatted token
            controller.enqueue(encoder.encode(aiSdkFormattedData));
          } catch (encodeError) {
            console.error('Error encoding token:', encodeError, { token: cleanToken });
            // Continue processing even if one token fails
          }
        }
        
        console.log('Stream processing completed successfully');
        
        // Call completion callback with full content if provided
        if (onCompletion) {
          try {
            await onCompletion(fullContent);
          } catch (callbackError) {
            console.error('Error in completion callback:', callbackError);
            // Don't rethrow - we still want to close the stream
          }
        }
        
        // Send final completion signal
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        console.error('Error in CustomOpenAIStream:', error);
        
        // Try to send an error message to the client in the correct format
        try {
          const errorMessage = 'data: {"text": "An error occurred while processing the response."}\n\n';
          controller.enqueue(encoder.encode(errorMessage));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (followupError) {
          // Last resort - just close with error
          console.error('Failed to send error message to client:', followupError);
        }
        
        controller.error(error);
      }
    }
  });
}