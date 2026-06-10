import { useState, useCallback } from 'react';

/**
 * Reusable notification toast hook.
 * Returns `{ notification, showNotification }`.
 */
export function useNotification(autoHideMs = 4000) {
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const showNotification = useCallback(
    (message, type = 'success') => {
      setNotification({ show: true, message, type });
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), autoHideMs);
    },
    [autoHideMs],
  );

  return { notification, showNotification };
}
