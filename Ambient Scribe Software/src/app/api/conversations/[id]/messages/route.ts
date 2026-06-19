import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: conversationId } = await params;

  const mockReply = {
    id: `msg-${Date.now()}`,
    conversation_id: conversationId,
    role: 'assistant',
    content: "Thank you for your message. This is a mock response — wire in the local LLM at src/lib/local-llm/generate-note.ts to enable real AI replies.",
    created_at: new Date().toISOString(),
  };

  return NextResponse.json({ message: mockReply });
}
