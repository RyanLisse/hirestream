import { mastra } from '@/src/mastra';
import { NextResponse } from 'next/server';

/**
 * POST /api/chat/stream
 *
 * Streaming chat endpoint for Mastra agents.
 * Uses Server-Sent Events (SSE) to stream agent responses.
 *
 * Request body:
 * {
 *   "message": "Find Java jobs in Utrecht",
 *   "agentId": "recruitment-agent" (optional)
 * }
 *
 * Response: text/event-stream with AI SDK protocol
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, agentId = 'recruitment-agent' } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const agent = mastra.getAgent(agentId);

    if (!agent) {
      return NextResponse.json(
        { error: `Agent '${agentId}' not found` },
        { status: 404 }
      );
    }

    const stream = await agent.stream(message);

    return stream.toDataStreamResponse();
  } catch (error) {
    console.error('Stream API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
