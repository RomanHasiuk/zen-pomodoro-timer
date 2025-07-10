
import { useState, useEffect, useCallback } from 'react';

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const newPermission = await Notification.requestPermission();
      setPermission(newPermission);
      return newPermission;
    }
    return 'denied';
  }, []);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission === 'granted') {
      new Notification(title, options);
    }
  }, [permission]);

  return { requestPermission, sendNotification, permission };
};
