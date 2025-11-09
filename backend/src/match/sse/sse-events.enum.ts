/**
 * SSE event types for lobby and match updates
 */
export enum SseEvent {
  // Lobby events
  LOBBY_CREATED = 'lobby-created',
  LOBBY_UPDATED = 'lobby-updated',
  LOBBY_DELETED = 'lobby-deleted',

  // Player events
  PLAYER_JOINED = 'player-joined',
  PLAYER_LEFT = 'player-left',
  PLAYER_READY_CHANGED = 'player-ready-changed',

  // Match events
  MATCH_STARTED = 'match-started',
  MATCH_CONFIRMED = 'match-confirmed',
  MATCH_COMPLETED = 'match-completed',
  MATCH_CANCELLED = 'match-cancelled',

  // System events
  KEEPALIVE = 'keepalive',
}
