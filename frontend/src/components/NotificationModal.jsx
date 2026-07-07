import React from 'react';

/**
 * Centered animated modal for confirmations and notifications.
 * Use for: approve confirm, success, error, partial fulfillment messages.
 */
const NotificationModal = ({
  open,
  type = 'info', // 'confirm' | 'success' | 'error' | 'info'
  title = '',
  message = '',
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  const isConfirm = type === 'confirm';
  const iconBg =
    type === 'success' ? 'bg-emerald-100 text-emerald-600' :
    type === 'error' ? 'bg-rose-100 text-rose-600' :
    type === 'confirm' ? 'bg-primary-100 text-primary-600' :
    'bg-sky-100 text-sky-600';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={isConfirm ? onCancel : onConfirm}
        aria-hidden="true"
      />
      {/* Modal card */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${iconBg}`}>
            {type === 'success' && (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {type === 'error' && (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {(type === 'confirm' || type === 'info') && (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          {title && (
            <h3 id="notification-modal-title" className="text-xl font-bold text-gray-900 mb-2">
              {title}
            </h3>
          )}
          <p className="text-gray-600 mb-6 whitespace-pre-line">{message}</p>
          <div className="flex gap-3 w-full sm:w-auto flex-col-reverse sm:flex-row">
            {isConfirm && (
              <button
                type="button"
                onClick={onCancel}
                className="btn-secondary-dash flex-1 sm:flex-initial"
              >
                {cancelText}
              </button>
            )}
            <button
              type="button"
              onClick={onConfirm}
              className={`flex-1 sm:flex-initial ${type === 'error' ? 'btn-primary-dash' : 'btn-primary-dash'}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
