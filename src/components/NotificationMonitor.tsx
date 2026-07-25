'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { processSeriesNotifications } from '@/lib/seriesMonitor';

export default function NotificationMonitor() {
  const { myList, addNotifications } = useAppStore();

  useEffect(() => {
    async function runCheck() {
      if (!myList || myList.length === 0) return;
      try {
        const newItems = await processSeriesNotifications(myList);
        if (newItems.length > 0) {
          addNotifications(newItems);
        }
      } catch (err) {
        console.error('Notification check error:', err);
      }
    }

    runCheck();
  }, [myList, addNotifications]);

  return null;
}
