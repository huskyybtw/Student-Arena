import { Injectable, MessageEvent } from '@nestjs/common';
import { Subject } from 'rxjs';

export interface SseClient {
  id: string;
  lobbyId?: number;
  subject: Subject<MessageEvent>;
}

/**
 * Generic SSE service for broadcasting events to connected clients
 */
@Injectable()
export class SseService {
  private clients: Map<string, SseClient> = new Map();

  /**
   * Add a client to the broadcast list
   */
  addClient(client: SseClient): void {
    this.clients.set(client.id, client);
  }

  /**
   * Remove a client from the broadcast list
   */
  removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.subject.complete();
      this.clients.delete(clientId);
    }
  }

  /**
   * Broadcast an event to all connected clients
   */
  emit(event: string, data: any): void {
    const message = { type: 'message', data: { event, data } } as MessageEvent;
    this.clients.forEach((client) => {
      client.subject.next(message);
    });
  }

  /**
   * Emit event to clients watching a specific lobby
   */
  emitToLobby(lobbyId: number, event: string, data: any): void {
    const message = { type: 'message', data: { event, data } } as MessageEvent;
    this.clients.forEach((client) => {
      if (client.lobbyId === lobbyId) {
        client.subject.next(message);
      }
    });
  }

  /**
   * Send keepalive message to prevent connection timeout
   */
  sendKeepalive(): void {
    const message = {
      type: 'message',
      data: { event: 'keepalive' },
    } as MessageEvent;
    this.clients.forEach((client) => {
      client.subject.next(message);
    });
  }

  /**
   * Get the number of connected clients
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Get the number of clients watching a specific lobby
   */
  getLobbyClientCount(lobbyId: number): number {
    return Array.from(this.clients.values()).filter(
      (client) => client.lobbyId === lobbyId,
    ).length;
  }
}
