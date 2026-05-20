import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import Modal from './Modal'

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Confirm Action', message, loading, variant = 'danger' }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}
          >
            {loading ? 'Processing…' : 'Confirm'}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{message}</p>
      </div>
    </Modal>
  )
}
