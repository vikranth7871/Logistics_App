import apiClient from '@api/client';

export const notificationsApi = {
  getAll: (page = 1, limit = 20) =>
    apiClient.get('/notifications', { params: { page, limit } }).then((r) => r.data.data),

  getUnreadCount: () =>
    apiClient.get('/notifications/unread-count').then((r) => r.data.count as number),

  markRead: (id: string) =>
    apiClient.patch(`/notifications/${id}/read`),

  markAllRead: () =>
    apiClient.patch('/notifications/read-all'),
};
