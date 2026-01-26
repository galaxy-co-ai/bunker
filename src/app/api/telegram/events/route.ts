import { NextRequest } from "next/server";
import { subscribe } from "@/lib/telegram/events";

// GET /api/telegram/events - Server-Sent Events for real-time message updates
export async function GET(request: NextRequest) {
  const conversationId = request.nextUrl.searchParams.get("conversationId");

  if (!conversationId) {
    return new Response(
      JSON.stringify({ error: "conversationId is required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send initial connection message
      const connectMessage = `data: ${JSON.stringify({ type: "connected", conversationId })}\n\n`;
      controller.enqueue(encoder.encode(connectMessage));

      // Subscribe to messages for this conversation
      const unsubscribe = subscribe(conversationId, (event) => {
        try {
          const sseMessage = `data: ${JSON.stringify({
            type: "message",
            message: {
              id: event.message.id,
              role: event.message.role,
              content: event.message.content,
              createdAt: event.message.createdAt.toISOString(),
            },
          })}\n\n`;
          controller.enqueue(encoder.encode(sseMessage));
        } catch (error) {
          console.error("Error sending SSE message:", error);
        }
      });

      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          const heartbeat = `data: ${JSON.stringify({ type: "heartbeat", timestamp: Date.now() })}\n\n`;
          controller.enqueue(encoder.encode(heartbeat));
        } catch {
          // Connection might be closed, clear interval
          clearInterval(heartbeatInterval);
        }
      }, 30000);

      // Clean up on close
      request.signal.addEventListener("abort", () => {
        unsubscribe();
        clearInterval(heartbeatInterval);
        try {
          controller.close();
        } catch {
          // Controller might already be closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable buffering for nginx
    },
  });
}
