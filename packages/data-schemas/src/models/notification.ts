import notificationSchema from '~/schema/notification';
import type { INotification } from '~/schema/notification';

export function createNotificationModel(mongoose: typeof import('mongoose')) {
  return mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);
}
