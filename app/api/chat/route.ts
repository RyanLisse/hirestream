import { NextRequest, NextResponse } from "next/server";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request body. Expected 'messages' array." },
        { status: 400 }
      );
    }

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // TODO: Replace with actual Mastra agent integration
          // For now, we'll simulate a response
          const lastUserMessage = messages.filter((m: Message) => m.role === "user").pop();
          const query = lastUserMessage?.content.toLowerCase() || "";

          // Simulate tool calls based on query
          const toolCalls = [];
          if (query.includes("scrape")) {
            if (query.includes("striive")) {
              toolCalls.push({
                name: "scrape-platform",
                args: { platform: "Striive" },
                result: { listingsFound: 152, newListings: 23 },
              });
            } else if (query.includes("all")) {
              toolCalls.push(
                {
                  name: "scrape-platform",
                  args: { platform: "Striive" },
                  result: { listingsFound: 152, newListings: 23 },
                },
                {
                  name: "scrape-platform",
                  args: { platform: "Opdrachtoverheid" },
                  result: { listingsFound: 89, newListings: 12 },
                },
                {
                  name: "scrape-platform",
                  args: { platform: "Flextender" },
                  result: { listingsFound: 67, newListings: 8 },
                }
              );
            }
          }

          // Generate response content
          let content = "";
          if (query.includes("scrape") && query.includes("striive")) {
            content = "I've scraped Striive and found 152 job listings, including 23 new ones. The scraping completed successfully in 4.5 seconds.";
          } else if (query.includes("scrape") && query.includes("all")) {
            content = "I've scraped all platforms:\n\n• Striive: 152 listings (23 new)\n• Opdrachtoverheid: 89 listings (12 new)\n• Flextender: 67 listings (8 new)\n\nTotal: 308 listings with 43 new entries.";
          } else if (query.includes("pipeline") && query.includes("stats")) {
            content = "Here are your current pipeline statistics:\n\n• Total candidates: 127\n• In screening: 34\n• In interview: 18\n• Offer extended: 5\n• Hired this month: 8";
          } else if (query.includes("grade") && query.includes("candidate")) {
            content = "I can help you grade candidates using AI-powered resume analysis. Would you like me to:\n\n1. Grade all new candidates\n2. Grade candidates for a specific position\n3. Re-grade existing candidates with updated criteria";
          } else {
            content = `I understand you're asking about: "${lastUserMessage?.content}". I can help you with scraping job platforms, analyzing candidates, managing your pipeline, and more. What would you like me to do?`;
          }

          // Stream the response
          const response = {
            role: "assistant",
            content,
            toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
          };

          // Send the complete response as a single chunk
          const chunk = encoder.encode(JSON.stringify(response) + "\n");
          controller.enqueue(chunk);

          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          const errorChunk = encoder.encode(
            JSON.stringify({
              role: "assistant",
              content: "Sorry, I encountered an error processing your request.",
            }) + "\n"
          );
          controller.enqueue(errorChunk);
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
