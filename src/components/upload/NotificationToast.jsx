export function NotificationToast({ notification }) {
  if (!notification.show) return null;

  const bgColor =
    notification.type === 'error'
      ? 'bg-red-600'
      : notification.type === 'warning'
        ? 'bg-yellow-600'
        : notification.type === 'info'
          ? 'bg-blue-600'
          : 'bg-green-600';

  const Icon = () => {
    const cls = 'w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0';
    switch (notification.type) {
      case 'error':
        return (
          <svg className={cls} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className={cls} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg className={cls} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className={cls} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className={`fixed top-2 sm:top-4 right-2 sm:right-4 z-50 p-2 sm:p-3 rounded-lg shadow-lg max-w-[calc(100vw-1rem)] sm:max-w-sm transition-all duration-300 transform translate-y-0 opacity-100 ${bgColor}`}>
      <div className="flex items-center gap-2">
        <Icon />
        <span className="text-xs sm:text-sm font-medium">{notification.message}</span>
      </div>
    </div>
  );
}
