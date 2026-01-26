/**
 * Simple in-memory pub/sub for Telegram message events
 * Used to broadcast webhook messages to SSE clients
 */

type MessageEvent = {
  conversationId: string;
  message: {
    id: string;
    role: "assistant";
    content: string;
    createdAt: Date;
  };
};

type Subscriber = (event: MessageEvent) => void;

// Map of conversationId -> Set of subscriber callbacks
const subscribers = new Map<string, Set<Subscriber>>();

// Global subscribers (receive all messages)
const globalSubscribers = new Set<Subscriber>();

/**
 * Subscribe to messages for a specific conversation
 * Returns an unsubscribe function
 */
export function subscribe(
  conversationId: string,
  callback: Subscriber
): () => void {
  if (!subscribers.has(conversationId)) {
    subscribers.set(conversationId, new Set());
  }
  subscribers.get(conversationId)!.add(callback);

  return () => {
    const subs = subscribers.get(conversationId);
    if (subs) {
      subs.delete(callback);
      if (subs.size === 0) {
        subscribers.delete(conversationId);
      }
    }
  };
}

/**
 * Subscribe to all messages (for debugging/monitoring)
 */
export function subscribeAll(callback: Subscriber): () => void {
  globalSubscribers.add(callback);
  return () => {
    globalSubscribers.delete(callback);
  };
}

/**
 * Publish a message event to subscribers
 */
export function publish(event: MessageEvent): void {
  // Notify conversation-specific subscribers
  const subs = subscribers.get(event.conversationId);
  if (subs) {
    for (const callback of subs) {
      try {
        callback(event);
      } catch (error) {
        console.error("Error in subscriber callback:", error);
      }
    }
  }

  // Notify global subscribers
  for (const callback of globalSubscribers) {
    try {
      callback(event);
    } catch (error) {
      console.error("Error in global subscriber callback:", error);
    }
  }
}

/**
 * Get the number of subscribers for a conversation
 */
export function getSubscriberCount(conversationId: string): number {
  return subscribers.get(conversationId)?.size || 0;
}

/**
 * Get total number of active connections
 */
export function getTotalConnections(): number {
  let total = 0;
  for (const subs of subscribers.values()) {
    total += subs.size;
  }
  return total + globalSubscribers.size;
}
