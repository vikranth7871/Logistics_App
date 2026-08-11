import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { notificationsApi } from '@api/notifications.api';
import { wsService } from '../services/websocket.service';
import toast from 'react-hot-toast';

export const NOTIF_KEYS = {
  all: ['notifications'] as const,
  list: (page: number) => ['notifications', 'list', page] as const,
  unread: () => ['notifications', 'unread-count'] as const,
};

/** Paginated notifications list */
export function useNotifications(page = 1) {
  return useQuery({
    queryKey: NOTIF_KEYS.list(page),
    queryFn: () => notificationsApi.getAll(page, 20),
    staleTime: 30_000,
  });
}

/** Unread badge count */
export function useUnreadCount() {
  return useQuery({
    queryKey: NOTIF_KEYS.unread(),
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 60_000, // Poll every 60s as fallback
    staleTime: 10_000,
  });
}

/** Mark a single notification read */
export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIF_KEYS.all });
      qc.invalidateQueries({ queryKey: NOTIF_KEYS.unread() });
    },
  });
}

/** Mark all notifications read */
export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIF_KEYS.all });
      qc.invalidateQueries({ queryKey: NOTIF_KEYS.unread() });
    },
  });
}

/** Listens for real-time notifications via WebSocket and updates cache */
export function useRealtimeNotifications() {
  const qc = useQueryClient();
  const toastShownRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const unsub = wsService.on<{
      id: string;
      title: string;
      message: string;
      severity: string;
    }>('notification', (data) => {
      // Avoid duplicate toasts
      if (toastShownRef.current.has(data.id)) return;
      toastShownRef.current.add(data.id);

      // Show toast popup
      const toastFn =
        data.severity === 'success' ? toast.success
        : data.severity === 'warning' ? toast
        : data.severity === 'error' ? toast.error
        : toast;

      toastFn(`🔔 ${data.title}: ${data.message}`, { duration: 5000 });

      // Refresh notification list and badge
      qc.invalidateQueries({ queryKey: NOTIF_KEYS.all });
      qc.invalidateQueries({ queryKey: NOTIF_KEYS.unread() });
    });

    return unsub;
  }, [qc]);
}
