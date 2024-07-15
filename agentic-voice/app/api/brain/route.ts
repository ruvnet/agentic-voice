import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { extractKeywords, keywords } from "../utils/keywords";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const runtime = "edge";

const TARGET_KEYWORDS = Object.keys(keywords);

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function searchExaAPI(query: string, apiKey: string, numResults: number = 5) {
  const response = await fetch('https://api.exa.ai/search', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({ query, numResults })
  });

  if (!response.ok) {
    throw new Error(`Exa API search failed with status ${response.status}`);
  }

  const data = await response.json();
  console.log(`searchExaAPI response for query "${query}":`, data);

  if (!data.results) {
    throw new Error('No results found in Exa API response');
  }

  return data;
}

async function getContentsExaAPI(ids: string[], apiKey: string) {
  const response = await fetch('https://api.exa.ai/contents', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({ ids })
  });

  if (!response.ok) {
    throw new Error(`Exa API contents fetch failed with status ${response.status}`);
  }

  const data = await response.json();
  console.log("getContentsExaAPI response:", data);

  if (!data.results) {
    throw new Error('No results found in Exa API response');
  }

  return data;
}

export async function POST(req: Request) {
  try {
    console.log("Request received at:", new Date().toISOString());

    const { messages }: { messages: Message[] } = await req.json();
    console.log("Messages extracted:", messages);

    const start = Date.now();
    const userMessage = messages.filter((msg: Message) => msg.role === 'user').map((msg: Message) => msg.content).join(' ');
    const extractedKeywords = extractKeywords(messages);
    console.log("Keywords extracted:", extractedKeywords);

    // Check if the user's message contains any of the target keywords
    const containsTargetKeyword = TARGET_KEYWORDS.some(keyword => userMessage.includes(keyword));

    // Use the user's message directly if it contains a target keyword, otherwise fall back to extracted keywords
    const searchQuery = containsTargetKeyword ? userMessage : extractedKeywords.find(keyword => TARGET_KEYWORDS.includes(keyword)) || userMessage;
    console.log("Search query:", searchQuery);

    // Perform search using Exa API with the search query
    const searchResults = await searchExaAPI(searchQuery, process.env.EXASEARCH_API_KEY!, 5);
    const ids = searchResults.results?.map((res: any) => res.id) || [];
    console.log("Search results IDs:", ids);

    // Fallback message if no IDs are found
    if (ids.length === 0) {
      const fallbackMessage = "No relevant content found for the keywords provided.";
      console.log(fallbackMessage);
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        stream: true,
        messages: [
          ...messages,
          {
            role: "system",
            content: fallbackMessage
          }
        ],
      });
      console.log("OpenAI fallback response created");

      const stream = OpenAIStream(response);
      console.log("OpenAI response stream created");

      return new StreamingTextResponse(stream, {
        headers: {
          "X-LLM-Start": `${start}`,
          "X-LLM-Response": `${Date.now()}`,
        },
      });
    }

    // Get the content based on search results
    const exaApiResponse = await getContentsExaAPI(ids.slice(0, 5), process.env.EXASEARCH_API_KEY!); // Limit to 5 contents
    console.log("Exa API response:", exaApiResponse);

    const retrievedData = exaApiResponse.results.map((result: any) => ({
      id: result.id,
      url: result.url,
      title: result.title,
      author: result.author,
      text: result.text ? result.text.slice(0, 500) : "No text available", // Limit text to 500 characters and handle missing text
    }));

    // Use the retrieved data to generate contextually relevant responses
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      stream: true,
      messages: [
        ...messages,
        {
          role: "system",
          content: `Here are the top results for your query:\n${retrievedData.map((item: { title: string; url: string; author: string; text: string; }) => `Title: ${item.title}\nURL: ${item.url}\nAuthor: ${item.author}\nText: ${item.text}\n`).join('\n\n')}`
        }
      ],
    });
    console.log("OpenAI response created");

    const stream = OpenAIStream(response);
    console.log("OpenAI response stream created");

    return new StreamingTextResponse(stream, {
      headers: {
        "X-LLM-Start": `${start}`,
        "X-LLM-Response": `${Date.now()}`,
      },
    });
  } catch (error) {
    console.error("Error generating response with RAG structure", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
