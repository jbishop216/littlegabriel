import OpenAI from "openai";
import { ENV } from "./env";

/**
 * Creates and returns a configured OpenAI client
 * Uses the newest OpenAI GPT-4o model
 */
export function createOpenAIClient() {
  const apiKey = ENV.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("Missing OpenAI API key. Please set OPENAI_API_KEY in environment variables.");
  }
  
  return new OpenAI({ 
    apiKey: apiKey,
    // Note: The default model will be specified in each API call
    maxRetries: 2,
    timeout: 30000
  });
}

/**
 * Generates text using OpenAI's GPT-4o model
 */
export async function generateText(prompt: string): Promise<string> {
  const openai = createOpenAIClient();
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000
    });
    
    return response.choices[0].message.content || "No response generated.";
  } catch (error) {
    console.error("Error generating text:", error);
    throw error;
  }
}

/**
 * Get the assistant ID from environment with fallback
 */
export function getAssistantId(): string {
  return ENV.OPENAI_ASSISTANT_ID || "asst_BpFiJmyhoHFYUj5ooLEoHEX2";
}

/**
 * Creates a thread, adds a message, and runs the assistant
 */
export async function createThreadAndRun(userMessage: string): Promise<{
  threadId: string;
  runId: string;
}> {
  const openai = createOpenAIClient();
  const assistantId = getAssistantId();
  
  // Create a thread
  const thread = await openai.beta.threads.create();
  
  // Add the message to the thread
  await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: userMessage
  });
  
  // Run the assistant
  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistantId
  });
  
  return {
    threadId: thread.id,
    runId: run.id
  };
}

/**
 * Wait for a run to complete
 */
export async function waitForRunCompletion(
  threadId: string,
  runId: string,
  maxAttempts = 30
): Promise<OpenAI.Beta.Threads.Runs.Run> {
  const openai = createOpenAIClient();
  const terminalStates = ["completed", "failed", "cancelled", "expired"];
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const run = await openai.beta.threads.runs.retrieve(threadId, runId);
    
    if (terminalStates.includes(run.status)) {
      return run;
    }
    
    // Wait 1 second before polling again
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }
  
  throw new Error("Run timed out");
}

/**
 * Get the latest assistant message
 */
export async function getLatestAssistantMessage(threadId: string): Promise<string> {
  const openai = createOpenAIClient();
  
  const messages = await openai.beta.threads.messages.list(threadId);
  
  // Find the latest assistant message
  const assistantMessages = messages.data.filter(msg => msg.role === "assistant");
  
  if (assistantMessages.length === 0) {
    throw new Error("No assistant messages found");
  }
  
  // Extract the text content
  const latestMessage = assistantMessages[0];
  let responseText = "";
  
  for (const content of latestMessage.content) {
    if (content.type === "text") {
      responseText += content.text.value;
    }
  }
  
  return responseText;
}

/**
 * Complete assistant conversation flow
 */
export async function completeAssistantConversation(
  userMessage: string
): Promise<string> {
  try {
    // Create thread and run
    const { threadId, runId } = await createThreadAndRun(userMessage);
    
    // Wait for run to complete
    const run = await waitForRunCompletion(threadId, runId);
    
    if (run.status !== "completed") {
      throw new Error(`Run failed with status: ${run.status}`);
    }
    
    // Get assistant's response
    const assistantResponse = await getLatestAssistantMessage(threadId);
    
    return assistantResponse;
  } catch (error) {
    console.error("Error in completing assistant conversation:", error);
    throw error;
  }
}