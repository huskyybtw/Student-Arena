import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getLobbyControllerFindOneQueryKey } from "@/lib/api/lobby/lobby";
import { toast } from "sonner";

interface SseMessage {
  event: string;
  data: any;
}

interface UseLobbySSEOptions {
  lobbyId: number;
  onStatusChange?: (status: string) => void;
  onMatchStarted?: (data: any) => void;
  onMatchCompleted?: (data: any) => void;
}

export function useLobbySSE({
  lobbyId,
  onStatusChange,
  onMatchStarted,
  onMatchCompleted,
}: UseLobbySSEOptions) {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Create SSE connection
    const eventSource = new EventSource(
      `http://localhost:3001/lobby/sse/stream?lobbyId=${lobbyId}`
    );
    eventSourceRef.current = eventSource;

    // Handle incoming messages
    eventSource.onmessage = (event) => {
      try {
        const message: SseMessage = JSON.parse(event.data);

        switch (message.event) {
          case "connected":
            console.log("SSE connected:", message.data);
            break;

          case "keepalive":
            break;

          case "lobby:status-changed":
            console.log("Lobby status changed:", message.data);
            queryClient.invalidateQueries({
              queryKey: getLobbyControllerFindOneQueryKey(lobbyId),
            });
            onStatusChange?.(message.data.status);
            break;

          case "match:started":
            console.log("Match started:", message.data);
            queryClient.invalidateQueries({
              queryKey: getLobbyControllerFindOneQueryKey(lobbyId),
            });
            toast.success("Mecz został rozpoczęty!");
            onMatchStarted?.(message.data);
            break;

          case "match:completed":
            console.log("Match completed:", message.data);
            queryClient.invalidateQueries({
              queryKey: getLobbyControllerFindOneQueryKey(lobbyId),
            });
            toast.success("Mecz został zakończony!");
            onMatchCompleted?.(message.data);
            break;

          default:
            console.log("Unknown SSE event:", message);
        }
      } catch (error) {
        console.error("Error parsing SSE message:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [lobbyId, queryClient, onStatusChange, onMatchStarted, onMatchCompleted]);

  return {
    disconnect: () => {
      eventSourceRef.current?.close();
    },
  };
}
