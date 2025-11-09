import { Controller, Query, Sse, MessageEvent } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SseService } from '../sse/sse.service';
import { Observable, interval, Subject } from 'rxjs';
import { randomUUID } from 'crypto';

@ApiTags('sse')
@Controller('lobby/sse')
export class LobbySseController {
  constructor(private readonly sseService: SseService) {}

  /**
   * GET /lobby/sse/stream - Establish SSE connection for real-time updates
   */
  @Sse('stream')
  @ApiOperation({
    description:
      'Establish Server-Sent Events connection for real-time lobby updates',
  })
  @ApiQuery({
    name: 'lobbyId',
    required: false,
    description: 'Optional lobby ID to subscribe to specific lobby updates',
    type: Number,
  })
  stream(@Query('lobbyId') lobbyId?: number): Observable<MessageEvent> {
    const clientId = randomUUID();
    const subject = new Subject<MessageEvent>();

    // Add client to service
    this.sseService.addClient({
      id: clientId,
      lobbyId: lobbyId ? Number(lobbyId) : undefined,
      subject,
    });

    // Send initial connection message
    subject.next({
      type: 'message',
      data: {
        event: 'connected',
        data: { clientId, lobbyId },
      },
    } as MessageEvent);

    // Send keepalive every 30 seconds
    const keepaliveInterval = interval(30000).subscribe(() => {
      subject.next({
        type: 'message',
        data: { event: 'keepalive' },
      } as MessageEvent);
    });

    // Handle cleanup on connection close
    subject.subscribe({
      complete: () => {
        keepaliveInterval.unsubscribe();
        this.sseService.removeClient(clientId);
      },
    });

    return subject.asObservable();
  }
}
