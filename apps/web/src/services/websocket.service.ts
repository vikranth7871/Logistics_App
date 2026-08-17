import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@store/auth.store';

/**
 * WebSocket service — singleton connection to the NestJS notifications gateway.
 * Handles auto-reconnect, authentication and event subscription.
 */
class WebSocketService {
  private socket: Socket | null = null;
  private readonly WS_URL =
    import.meta.env.VITE_WS_URL || window.location.origin;

  connect() {
    const token = useAuthStore.getState().accessToken;
    if (!token) return;
    if (this.socket?.connected) return;

    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(`${this.WS_URL}/notifications`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10_000,
    });

    this.socket.on('connect', () => {
      console.log('🔌 WebSocket connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      // Gracefully log without crashing
      console.debug('WebSocket connection note:', err.message);
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  /**
   * Subscribe to an event. Returns an unsubscribe function.
   * Usage: const unsub = wsService.on('notification', handler);
   *        // On cleanup: unsub();
   */
  on<T = any>(event: string, handler: (data: T) => void): () => void {
    this.socket?.on(event, handler);
    return () => this.socket?.off(event, handler);
  }

  emit(event: string, data?: any) {
    this.socket?.emit(event, data);
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const wsService = new WebSocketService();
