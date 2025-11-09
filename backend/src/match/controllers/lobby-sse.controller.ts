import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SseService } from '../sse/sse.service';

@ApiTags('sse')
@Controller('lobby/sse')
export class LobbySseController {
  constructor(private readonly sseService: SseService) {}

  /**
   * GET /lobby/sse/stream - Establish SSE connection for real-time updates
   */
  // @Sse('stream')
  async stream() {
    // TODO: Implement
    // 1. Create SSE response stream
    // 2. Add client to broadcast list
    // 3. Send initial connection message
    // 4. Keep connection alive with periodic keepalive
    // 5. Handle client disconnection
  }
}
