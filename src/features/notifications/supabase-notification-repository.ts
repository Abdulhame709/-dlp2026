import { NotificationItem, NotificationType } from './notification-types';
import { createClient } from '@/core/database/server';

export class SupabaseNotificationRepository {
  private mapRowToEntity(row: any): NotificationItem {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      message: row.message,
      type: row.type as NotificationType,
      isRead: row.read_status || false,
      actionUrl: row.action_url,
      createdAt: new Date(row.created_at),
    };
  }

  async getNotifications(userId: string): Promise<NotificationItem[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map((row) => this.mapRowToEntity(row));
  }

  async sendNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = 'ALERT',
    actionUrl?: string
  ): Promise<NotificationItem> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        read_status: false,
        action_url: actionUrl || null,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`NOTIFICATION_INSERT_FAILED: ${error?.message}`);
    }

    return this.mapRowToEntity(data);
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('notifications')
      .update({ read_status: true })
      .eq('id', notificationId);

    return !error;
  }
}
export type { NotificationItem, NotificationType };
