// route.ts is the entry point for the API route that handles the incoming requests and generates responses using the OpenAI API and Exa API.
import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { extractKeywords, keywords } from "../utils/keywords";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Optional, but recommended: run on the edge runtime.
// See https://vercel.com/docs/concepts/functions/edge-functions
export const runtime = "edge";

const TARGET_KEYWORDS = Object.keys(keywords);

async function searchExaAPI(keyword: string, apiKey: string, numResults: number = 5) {
  const response = await fetch('https://api.exa.ai/search', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({ query: keyword, numResults })
  });

  const data = await response.json();
  console.log(`searchExaAPI response for keyword "${keyword}":`, data);

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

    const { messages } = await req.json();
    console.log("Messages extracted:", messages);

    const start = Date.now();
    const keywords = extractKeywords(messages);
    console.log("Keywords extracted:", keywords);

    // Filter keywords to include only target keywords
    const filteredKeywords = keywords.filter(keyword => TARGET_KEYWORDS.includes(keyword));
    console.log("Filtered keywords:", filteredKeywords);

    // Perform search using Exa API with the filtered keywords
    const searchResults = await Promise.all(
      filteredKeywords.map(async (keyword) => {
        try {
          return await searchExaAPI(keyword, process.env.EXASEARCH_API_KEY!, 5);
        } catch (error) {
          console.error(`Error searching Exa API for keyword "${keyword}":`, error);
          return { results: [] };
        }
      })
    );

    const ids = searchResults.flatMap(result => result.results?.map((res: any) => res.id) || []);
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
      text: result.text.slice(0, 500), // Limit text to 500 characters
    }));

    // Use the retrieved data to generate contextually relevant responses
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      stream: true,
      messages: [
        ...messages,
        {
          role: "system",
          content: `Here is an overview of the retrieved data: ${JSON.stringify(retrievedData)}`
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
