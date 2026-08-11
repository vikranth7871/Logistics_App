import apiClient from '@api/client';

export const notificationsApi = {
  getAll: (page = 1, limit = 20) =>
    apiClient
      .get('/notifications', { params: { page, limit } })
      .then((r) => r.data.data || { items: [], meta: { total: 0 } })
      .catch(() => ({ items: [], meta: { total: 0 } })),

  getUnreadCount: () =>
    apiClient
      .get('/notifications/unread-count')
      .then((r) => (typeof r.data?.count === 'number' ? r.data.count : 0))
      .catch(() => 0),

  markRead: (id: string) =>
    apiClient.patch(`/notifications/${id}/read`).catch(() => {}),

  markAllRead: () =>
    apiClient.patch('/notifications/read-all').catch(() => {}),
};
